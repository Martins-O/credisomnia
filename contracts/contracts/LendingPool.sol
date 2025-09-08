// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ILendingPool.sol";
import "./interfaces/ICreditOracle.sol";
import "./interfaces/IFlashLoanReceiver.sol";
import "./security/CredisomniaSecurity.sol";

/**
 * @title LendingPool
 * @dev Lending pool with dynamic collateral ratios based on credit scores
 * @author Credisomnia Team
 * @custom:security-contact security@credisomnia.com
 */
contract LendingPool is ILendingPool, CredisomniaSecurity {
    using SafeERC20 for IERC20;

    /// @dev Loan ID counter
    uint256 private _loanIdCounter;
    
    /// @dev The loan token (e.g., USDC)
    IERC20 public immutable loanToken;
    
    /// @dev The collateral token (could be different from loan token)
    IERC20 public immutable collateralToken;
    
    /// @dev Credit Oracle for credit score verification
    ICreditOracle public immutable creditOracle;
    
    /// @dev All loans mapping
    mapping(uint256 => Loan) public loans;
    
    /// @dev User loans mapping
    mapping(address => uint256[]) public userLoans;
    
    /// @dev Supplier information
    mapping(address => SupplierInfo) public suppliers;
    
    /// @dev Total liquidity supplied to the pool
    uint256 public totalLiquidity;
    
    /// @dev Total amount currently borrowed
    uint256 public totalBorrowed;
    
    /// @dev Liquidation threshold in basis points (8000 = 80%)
    uint256 public liquidationThreshold;
    
    /// @dev Liquidation bonus in basis points (500 = 5%)
    uint256 public liquidationBonus;
    
    /// @dev Maximum loan duration in seconds
    uint256 public maxLoanDuration;
    
    /// @dev Base interest rate in basis points (500 = 5% APY)
    uint256 public baseInterestRate;
    
    /// @dev Interest rate per second for calculations
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    
    /// @dev Maximum utilization rate (9500 = 95%)
    uint256 private constant MAX_UTILIZATION_RATE = 9500;
    
    /// @dev Whether lending is paused
    bool public lendingPaused;

    /// @dev Flash loan premium rate in basis points (9 = 0.09%)
    uint256 public flashLoanPremiumRate = 9;
    
    /// @dev Total flash loan fees collected
    uint256 public totalFlashLoanFees;
    
    /// @dev Flash loan execution tracking for reentrancy protection
    mapping(address => bool) private _flashLoanExecuting;

    modifier onlyWhenLendingNotPaused() {
        require(!lendingPaused, "LendingPool: Lending is paused");
        _;
    }

    modifier validLoan(uint256 loanId) {
        require(loans[loanId].status != LoanStatus.None, "LendingPool: Loan does not exist");
        _;
    }

    modifier onlyBorrower(uint256 loanId) {
        require(loans[loanId].borrower == msg.sender, "LendingPool: Not the borrower");
        _;
    }

    /**
     * @dev Constructor initializes the lending pool
     * @param admin Address to receive admin role
     * @param emergencyAddress Address for emergency operations
     * @param securityAddress Address for security operations
     * @param maxDailyVolume Maximum daily volume for security
     * @param _loanToken Address of the loan token
     * @param _collateralToken Address of the collateral token
     * @param _creditOracle Address of the Credit Oracle
     * @param _liquidationThreshold Liquidation threshold in basis points
     * @param _liquidationBonus Liquidation bonus in basis points
     * @param _maxLoanDuration Maximum loan duration in seconds
     * @param _baseInterestRate Base interest rate in basis points
     */
    constructor(
        address admin,
        address emergencyAddress,
        address securityAddress,
        uint256 maxDailyVolume,
        address _loanToken,
        address _collateralToken,
        address _creditOracle,
        uint256 _liquidationThreshold,
        uint256 _liquidationBonus,
        uint256 _maxLoanDuration,
        uint256 _baseInterestRate
    ) CredisomniaSecurity(admin, emergencyAddress, securityAddress, maxDailyVolume) {
        require(_loanToken != address(0), "LendingPool: Invalid loan token");
        require(_collateralToken != address(0), "LendingPool: Invalid collateral token");
        require(_creditOracle != address(0), "LendingPool: Invalid credit oracle");
        require(_liquidationThreshold > 0 && _liquidationThreshold < 10000, "LendingPool: Invalid liquidation threshold");
        require(_liquidationBonus < 1000, "LendingPool: Liquidation bonus too high");
        require(_maxLoanDuration > 0, "LendingPool: Invalid max loan duration");
        require(_baseInterestRate < 5000, "LendingPool: Interest rate too high");

        loanToken = IERC20(_loanToken);
        collateralToken = IERC20(_collateralToken);
        creditOracle = ICreditOracle(_creditOracle);
        liquidationThreshold = _liquidationThreshold;
        liquidationBonus = _liquidationBonus;
        maxLoanDuration = _maxLoanDuration;
        baseInterestRate = _baseInterestRate;
        
        // Start loan IDs from 1
        _loanIdCounter++;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function supplyLiquidity(uint256 amount) 
        external 
        override 
        onlyWhenNotPaused 
        nonReentrant 
        withinVolumeLimit(amount)
    {
        require(amount > 0, "LendingPool: Amount must be positive");

        // Transfer tokens from supplier
        loanToken.safeTransferFrom(msg.sender, address(this), amount);

        SupplierInfo storage supplier = suppliers[msg.sender];
        supplier.totalSupplied = supplier.totalSupplied + amount;
        supplier.lastSupplyTime = block.timestamp;
        supplier.availableToWithdraw = supplier.availableToWithdraw + amount;

        totalLiquidity = totalLiquidity + amount;
        _updateVolumeTracking(msg.sender, amount);

        emit LiquiditySupplied(msg.sender, amount, totalLiquidity);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function withdrawLiquidity(uint256 amount) 
        external 
        override 
        onlyWhenNotPaused 
        nonReentrant 
        withinVolumeLimit(amount)
    {
        SupplierInfo storage supplier = suppliers[msg.sender];
        require(supplier.totalSupplied > 0, "LendingPool: No liquidity supplied");

        // If amount is 0, withdraw maximum available
        if (amount == 0) {
            amount = supplier.availableToWithdraw;
        }

        require(amount > 0, "LendingPool: No amount to withdraw");
        require(amount <= supplier.availableToWithdraw, "LendingPool: Insufficient available balance");

        // Check if withdrawal would break utilization limit
        uint256 availableLiquidity = getAvailableLiquidity();
        require(amount <= availableLiquidity, "LendingPool: Insufficient pool liquidity");

        // Update supplier info
        supplier.availableToWithdraw = supplier.availableToWithdraw - amount;
        supplier.totalSupplied = supplier.totalSupplied - amount;

        totalLiquidity = totalLiquidity - amount;
        _updateVolumeTracking(msg.sender, amount);

        // Transfer tokens back to supplier
        loanToken.safeTransfer(msg.sender, amount);

        emit LiquidityWithdrawn(msg.sender, amount, totalLiquidity);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function requestLoan(
        uint256 loanAmount,
        uint256 collateralAmount,
        uint256 loanDuration
    ) 
        external 
        override 
        onlyWhenLendingNotPaused 
        onlyWhenNotPaused 
        nonReentrant 
        withinVolumeLimit(loanAmount)
        returns (uint256 loanId) 
    {
        require(loanAmount > 0, "LendingPool: Loan amount must be positive");
        require(loanDuration > 0 && loanDuration <= maxLoanDuration, "LendingPool: Invalid loan duration");
        require(loanAmount <= getAvailableLiquidity(), "LendingPool: Insufficient pool liquidity");

        // Check loan eligibility through credit oracle
        (bool eligible, string memory reason) = creditOracle.checkLoanEligibility(msg.sender, loanAmount);
        require(eligible, string(abi.encodePacked("LendingPool: ", reason)));

        // Calculate required collateral based on credit score
        uint256 requiredCollateral = creditOracle.calculateCollateralRequirement(msg.sender, loanAmount);
        require(collateralAmount >= requiredCollateral, "LendingPool: Insufficient collateral");

        // Transfer collateral from borrower
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Calculate interest rate based on utilization and credit score
        uint256 interestRate = _calculateInterestRate(msg.sender);

        // Create loan
        loanId = _loanIdCounter;
        _loanIdCounter++;

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            principalAmount: loanAmount,
            outstandingAmount: loanAmount,
            collateralAmount: collateralAmount,
            interestRate: interestRate,
            startTimestamp: block.timestamp,
            dueTimestamp: block.timestamp + loanDuration,
            lastPaymentTime: block.timestamp,
            status: LoanStatus.Active
        });

        userLoans[msg.sender].push(loanId);
        totalBorrowed = totalBorrowed + loanAmount;
        _updateVolumeTracking(msg.sender, loanAmount);

        // Transfer loan amount to borrower
        loanToken.safeTransfer(msg.sender, loanAmount);

        emit LoanIssued(loanId, msg.sender, loanAmount, collateralAmount, interestRate, block.timestamp + loanDuration);
        return loanId;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function repayLoan(uint256 loanId, uint256 amount) 
        external 
        override 
        validLoan(loanId)
        onlyBorrower(loanId)
        onlyWhenNotPaused 
        nonReentrant 
        withinVolumeLimit(amount)
    {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "LendingPool: Loan is not active");

        uint256 interestOwed = calculateInterestOwed(loanId);
        uint256 totalOwed = loan.outstandingAmount + interestOwed;

        // If amount is 0, repay full amount
        if (amount == 0) {
            amount = totalOwed;
        }

        require(amount > 0, "LendingPool: Amount must be positive");
        require(amount <= totalOwed, "LendingPool: Amount exceeds total owed");

        // Transfer repayment from borrower
        loanToken.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate principal and interest portions
        uint256 interestPortion = amount > interestOwed ? interestOwed : amount;
        uint256 principalPortion = amount - interestPortion;

        // Update loan
        loan.outstandingAmount = loan.outstandingAmount - principalPortion;
        loan.lastPaymentTime = block.timestamp;

        bool fullyRepaid = loan.outstandingAmount == 0;
        bool onTime = block.timestamp <= loan.dueTimestamp;

        if (fullyRepaid) {
            loan.status = LoanStatus.Repaid;
            totalBorrowed = totalBorrowed - loan.principalAmount;

            // Return collateral to borrower
            collateralToken.safeTransfer(msg.sender, loan.collateralAmount);
            loan.collateralAmount = 0;
        }

        // Distribute interest to suppliers (simplified - in production, use more sophisticated distribution)
        if (interestPortion > 0) {
            // For simplicity, keep interest in pool - in production, distribute proportionally
            totalLiquidity = totalLiquidity + interestPortion;
        }

        _updateVolumeTracking(msg.sender, amount);

        // Record repayment in credit oracle
        try creditOracle.recordRepayment(msg.sender, principalPortion, onTime) {
            // Successfully recorded
        } catch {
            // Continue even if credit oracle fails
        }

        emit LoanRepaid(loanId, msg.sender, amount, interestPortion, fullyRepaid);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function liquidateLoan(uint256 loanId) 
        external 
        override 
        validLoan(loanId)
        onlyWhenNotPaused 
        nonReentrant 
    {
        require(isLiquidatable(loanId), "LendingPool: Loan is not liquidatable");

        Loan storage loan = loans[loanId];
        uint256 interestOwed = calculateInterestOwed(loanId);
        uint256 totalOwed = loan.outstandingAmount + interestOwed;

        // Calculate liquidation amounts
        uint256 liquidationAmount = totalOwed;
        uint256 liquidationBonusAmount = liquidationAmount * liquidationBonus / 10000;
        uint256 totalLiquidationAmount = liquidationAmount + liquidationBonusAmount;

        // Validate liquidation amount doesn't exceed debt owed
        require(liquidationAmount <= totalOwed, "LendingPool: Liquidation amount exceeds debt owed");
        require(totalLiquidationAmount <= loan.collateralAmount, "LendingPool: Insufficient collateral for liquidation");

        // Transfer liquidation amount from liquidator
        loanToken.safeTransferFrom(msg.sender, address(this), liquidationAmount);

        // Transfer collateral to liquidator (including bonus)
        collateralToken.safeTransfer(msg.sender, totalLiquidationAmount);

        // Return remaining collateral to borrower if any
        uint256 remainingCollateral = loan.collateralAmount - totalLiquidationAmount;
        if (remainingCollateral > 0) {
            collateralToken.safeTransfer(loan.borrower, remainingCollateral);
        }

        // Update loan status
        loan.status = LoanStatus.Liquidated;
        loan.collateralAmount = 0;
        totalBorrowed = totalBorrowed - loan.principalAmount;

        emit LoanLiquidated(loanId, msg.sender, totalLiquidationAmount, liquidationBonusAmount);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getLoan(uint256 loanId) external view override returns (Loan memory) {
        require(loans[loanId].status != LoanStatus.None, "LendingPool: Loan does not exist");
        return loans[loanId];
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getUserLoans(address borrower) external view override returns (uint256[] memory) {
        return userLoans[borrower];
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getSupplierInfo(address supplier) external view override returns (SupplierInfo memory) {
        return suppliers[supplier];
    }

    /**
     * @inheritdoc ILendingPool
     */
    function calculateInterestOwed(uint256 loanId) public view override returns (uint256) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - loan.startTimestamp;
        uint256 interestOwed = loan.outstandingAmount
            * loan.interestRate
            * timeElapsed
            / SECONDS_PER_YEAR
            / 10000;

        return interestOwed;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function calculateHealthFactor(uint256 loanId) public view override returns (uint256) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) {
            return type(uint256).max; // Healthy if not active
        }

        uint256 interestOwed = calculateInterestOwed(loanId);
        uint256 totalDebt = loan.outstandingAmount + interestOwed;
        
        if (totalDebt == 0) {
            return type(uint256).max;
        }

        // Health factor = (collateral value * liquidation threshold) / total debt
        // Assuming 1:1 collateral:loan token ratio for simplicity
        uint256 healthFactor = loan.collateralAmount
            * liquidationThreshold
            * 1e18
            / totalDebt
            / 10000;

        return healthFactor;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function isLiquidatable(uint256 loanId) public view override returns (bool) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) {
            return false;
        }

        // Check if past due
        if (block.timestamp > loan.dueTimestamp) {
            return true;
        }

        // Check health factor
        uint256 healthFactor = calculateHealthFactor(loanId);
        return healthFactor < 1e18; // Health factor below 1.0
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getAvailableLiquidity() public view override returns (uint256) {
        return totalLiquidity - totalBorrowed;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getTotalValueLocked() external view override returns (uint256) {
        return totalLiquidity;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getUtilizationRate() public view override returns (uint256) {
        if (totalLiquidity == 0) {
            return 0;
        }
        return totalBorrowed * 10000 / totalLiquidity;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function updatePoolParameters(
        uint256 newLiquidationThreshold,
        uint256 newLiquidationBonus,
        uint256 newMaxLoanDuration
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newLiquidationThreshold > 0 && newLiquidationThreshold < 10000, "LendingPool: Invalid liquidation threshold");
        require(newLiquidationBonus < 1000, "LendingPool: Liquidation bonus too high");
        require(newMaxLoanDuration > 0, "LendingPool: Invalid max loan duration");

        liquidationThreshold = newLiquidationThreshold;
        liquidationBonus = newLiquidationBonus;
        maxLoanDuration = newMaxLoanDuration;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function pauseLending() external override onlyRole(EMERGENCY_ROLE) {
        lendingPaused = true;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function resumeLending() external override onlyRole(EMERGENCY_ROLE) {
        lendingPaused = false;
    }

    /**
     * @dev Calculates dynamic interest rate based on utilization and credit score
     * @param borrower Address of the borrower
     * @return Interest rate in basis points
     */
    function _calculateInterestRate(address borrower) internal view returns (uint256) {
        uint256 utilizationRate = getUtilizationRate();
        uint256 creditScore = creditOracle.getCreditScore(borrower);
        
        // Base rate + utilization premium + credit risk premium
        uint256 utilizationPremium = utilizationRate * baseInterestRate / 5000; // Up to 2x base rate at 100% utilization
        
        // Credit risk premium (inverse relationship with credit score)
        uint256 maxScore = 850;
        uint256 minScore = 300;
        uint256 creditRiskPremium = (maxScore - creditScore) * baseInterestRate / (maxScore - minScore) / 2;
        
        uint256 finalRate = baseInterestRate + utilizationPremium + creditRiskPremium;
        
        // Cap at reasonable maximum
        return finalRate > 2000 ? 2000 : finalRate; // Max 20% APY
    }

    /**
     * @dev Handles defaulted loans (admin function)
     * @param loanId ID of the loan to mark as defaulted
     */
    function markLoanAsDefaulted(uint256 loanId) 
        external 
        validLoan(loanId)
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "LendingPool: Loan is not active");
        require(block.timestamp > loan.dueTimestamp + 7 days, "LendingPool: Grace period not exceeded");

        loan.status = LoanStatus.Defaulted;
        totalBorrowed = totalBorrowed - loan.outstandingAmount;

        // Seize collateral
        uint256 collateralSeized = loan.collateralAmount;
        loan.collateralAmount = 0;

        emit LoanDefaulted(loanId, loan.borrower, collateralSeized);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function flashLoan(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params
    ) external override nonReentrant onlyWhenNotPaused onlyWhenLendingNotPaused {
        require(receiverAddress != address(0), "LendingPool: Invalid receiver address");
        require(asset == address(loanToken), "LendingPool: Unsupported asset");
        require(amount > 0, "LendingPool: Amount must be greater than 0");
        require(!_flashLoanExecuting[receiverAddress], "LendingPool: Flash loan already executing");
        
        uint256 availableLiquidity = getAvailableLiquidity();
        require(amount <= availableLiquidity, "LendingPool: Insufficient liquidity for flash loan");
        
        uint256 premium = getFlashLoanFee(amount);
        uint256 amountPlusPremium = amount + premium;
        
        // Record balances before flash loan
        uint256 balanceBefore = loanToken.balanceOf(address(this));
        require(balanceBefore >= amount, "LendingPool: Insufficient balance for flash loan");
        
        // Set reentrancy protection
        _flashLoanExecuting[receiverAddress] = true;
        
        // Transfer loan amount to receiver
        loanToken.safeTransfer(receiverAddress, amount);
        
        // Call receiver's executeOperation
        bool success = IFlashLoanReceiver(receiverAddress).executeOperation(
            asset,
            amount,
            premium,
            msg.sender,
            params
        );
        require(success, "LendingPool: Flash loan execution failed");
        
        // Clear reentrancy protection
        _flashLoanExecuting[receiverAddress] = false;
        
        // Verify repayment
        uint256 balanceAfter = loanToken.balanceOf(address(this));
        require(balanceAfter >= balanceBefore + premium, "LendingPool: Flash loan not repaid with premium");
        
        // Update flash loan fee tracking
        totalFlashLoanFees += premium;
        
        // Add premium to total liquidity (revenue for liquidity providers)
        totalLiquidity += premium;
        
        emit FlashLoan(receiverAddress, msg.sender, asset, amount, premium);
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getFlashLoanFee(uint256 amount) public view override returns (uint256) {
        return (amount * flashLoanPremiumRate) / 10000;
    }

    /**
     * @inheritdoc ILendingPool
     */
    function getFlashLoanPremiumRate() external view override returns (uint256) {
        return flashLoanPremiumRate;
    }

    /**
     * @dev Updates the flash loan premium rate (admin only)
     * @param newRate New premium rate in basis points
     */
    function setFlashLoanPremiumRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 1000, "LendingPool: Premium rate too high"); // Max 10%
        flashLoanPremiumRate = newRate;
    }

    /**
     * @dev Gets the total flash loan fees collected
     * @return Total flash loan fees in loan token
     */
    function getTotalFlashLoanFees() external view returns (uint256) {
        return totalFlashLoanFees;
    }

    /**
     * @dev Checks if a flash loan is currently executing for an address
     * @param account Address to check
     * @return True if flash loan is executing
     */
    function isFlashLoanExecuting(address account) external view returns (bool) {
        return _flashLoanExecuting[account];
    }
}
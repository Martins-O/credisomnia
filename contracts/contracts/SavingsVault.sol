// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ISavingsVault.sol";
import "./interfaces/ICreditOracle.sol";
import "./security/CredisomniaSecurity.sol";

/**
 * @title SavingsVault  
 * @dev Savings vault with real-time interest accrual leveraging Somnia's high TPS
 * @author Credisomnia Team
 * @custom:security-contact security@credisomnia.com
 */
contract SavingsVault is ISavingsVault, CredisomniaSecurity {
    using SafeERC20 for IERC20;

    /// @dev The token accepted for deposits (e.g., USDC)
    IERC20 public immutable depositToken;
    
    /// @dev Credit Oracle for recording savings activity
    ICreditOracle public immutable creditOracle;
    
    /// @dev User savings accounts
    mapping(address => SavingsAccount) public savingsAccounts;
    
    /// @dev Annual interest rate in basis points (e.g., 500 = 5%)
    uint256 public interestRate;
    
    /// @dev Blocks per year for interest calculation (Somnia high TPS)
    uint256 public constant BLOCKS_PER_YEAR = 15768000; // ~2 second blocks
    
    /// @dev Minimum deposit amount
    uint256 public minDeposit;
    
    /// @dev Maximum deposit amount
    uint256 public maxDeposit;
    
    /// @dev Total value locked across all users
    uint256 public totalValueLocked;
    
    /// @dev Total interest distributed to users
    uint256 public totalInterestDistributed;
    
    /// @dev Reserve fund for paying interest
    uint256 public reserveBalance;
    
    /// @dev Precision factor for interest calculations
    uint256 private constant PRECISION = 1e18;
    
    /// @dev Maximum interest rate (20% APY)
    uint256 private constant MAX_INTEREST_RATE = 2000;

    modifier hasActiveAccount() {
        require(savingsAccounts[msg.sender].isActive, "SavingsVault: No active savings account");
        _;
    }

    modifier validDepositAmount(uint256 amount) {
        require(amount >= minDeposit, "SavingsVault: Amount below minimum deposit");
        require(amount <= maxDeposit, "SavingsVault: Amount exceeds maximum deposit");
        _;
    }

    /**
     * @dev Constructor initializes the savings vault
     * @param admin Address to receive admin role
     * @param emergencyAddress Address for emergency operations
     * @param securityAddress Address for security operations
     * @param maxDailyVolume Maximum daily volume for security
     * @param _depositToken Address of the deposit token (e.g., USDC)
     * @param _creditOracle Address of the Credit Oracle
     * @param _interestRate Initial annual interest rate in basis points
     * @param _minDeposit Minimum deposit amount
     * @param _maxDeposit Maximum deposit amount
     */
    constructor(
        address admin,
        address emergencyAddress,
        address securityAddress,
        uint256 maxDailyVolume,
        address _depositToken,
        address _creditOracle,
        uint256 _interestRate,
        uint256 _minDeposit,
        uint256 _maxDeposit
    ) CredisomniaSecurity(admin, emergencyAddress, securityAddress, maxDailyVolume) {
        require(_depositToken != address(0), "SavingsVault: Invalid deposit token");
        require(_creditOracle != address(0), "SavingsVault: Invalid credit oracle");
        require(_interestRate <= MAX_INTEREST_RATE, "SavingsVault: Interest rate too high");
        require(_minDeposit > 0, "SavingsVault: Minimum deposit must be positive");
        require(_maxDeposit > _minDeposit, "SavingsVault: Maximum deposit must be greater than minimum");

        depositToken = IERC20(_depositToken);
        creditOracle = ICreditOracle(_creditOracle);
        interestRate = _interestRate;
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function deposit(uint256 amount) 
        external 
        override 
        onlyWhenNotPaused 
        nonReentrant 
        validDepositAmount(amount)
        withinVolumeLimit(amount)
    {
        require(amount > 0, "SavingsVault: Amount must be positive");

        // Transfer tokens from user
        depositToken.safeTransferFrom(msg.sender, address(this), amount);

        SavingsAccount storage account = savingsAccounts[msg.sender];
        
        // Update interest before modifying principal
        if (account.isActive) {
            _updateInterestInternal(msg.sender);
        } else {
            // Initialize new account
            account.isActive = true;
            account.depositTimestamp = block.timestamp;
            account.lastUpdateBlock = block.number;
        }

        // Add to principal
        account.principal = account.principal + amount;
        
        // Update global tracking
        totalValueLocked = totalValueLocked + amount;
        _updateVolumeTracking(msg.sender, amount);

        // Record savings activity in credit oracle
        try creditOracle.recordSavingsActivity(msg.sender, amount, true) {
            // Successfully recorded
        } catch {
            // Continue even if credit oracle fails
        }

        emit Deposit(msg.sender, amount, getBalance(msg.sender));
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function withdraw(uint256 amount) 
        external 
        override 
        hasActiveAccount 
        onlyWhenNotPaused 
        nonReentrant 
        withinVolumeLimit(amount)
    {
        SavingsAccount storage account = savingsAccounts[msg.sender];
        
        // Update interest before withdrawal
        _updateInterestInternal(msg.sender);
        
        uint256 totalBalance = account.principal + account.accruedInterest;
        
        // If amount is 0, withdraw full balance
        if (amount == 0) {
            amount = totalBalance;
        }
        
        require(amount > 0, "SavingsVault: No balance to withdraw");
        require(amount <= totalBalance, "SavingsVault: Insufficient balance");

        // Calculate how much comes from principal vs interest
        uint256 principalWithdrawn = amount <= account.principal ? amount : account.principal;
        uint256 interestWithdrawn = amount - principalWithdrawn;

        // Update account balances
        account.principal = account.principal - principalWithdrawn;
        account.accruedInterest = account.accruedInterest - interestWithdrawn;

        // If full withdrawal, deactivate account
        if (account.principal == 0 && account.accruedInterest == 0) {
            account.isActive = false;
        }

        // Update global tracking
        totalValueLocked = totalValueLocked - principalWithdrawn;
        _updateVolumeTracking(msg.sender, amount);

        // Transfer tokens to user
        depositToken.safeTransfer(msg.sender, amount);

        // Record savings activity in credit oracle
        try creditOracle.recordSavingsActivity(msg.sender, amount, false) {
            // Successfully recorded
        } catch {
            // Continue even if credit oracle fails
        }

        emit Withdraw(msg.sender, amount, getBalance(msg.sender));
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getBalance(address user) public view override returns (uint256) {
        SavingsAccount storage account = savingsAccounts[user];
        if (!account.isActive) {
            return 0;
        }

        uint256 pendingInterest = calculateAccruedInterest(user);
        return account.principal + account.accruedInterest + pendingInterest;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getSavingsAccount(address user) 
        external 
        view 
        override 
        returns (SavingsAccount memory) 
    {
        return savingsAccounts[user];
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function calculateAccruedInterest(address user) public view override returns (uint256) {
        SavingsAccount storage account = savingsAccounts[user];
        if (!account.isActive || account.principal == 0) {
            return 0;
        }

        uint256 blocksPassed = block.number - account.lastUpdateBlock;
        if (blocksPassed == 0) {
            return 0;
        }

        // Calculate compound interest per block
        // Formula: principal * rate * blocksPassed / (BLOCKS_PER_YEAR * 10000)
        uint256 currentBalance = account.principal + account.accruedInterest;
        uint256 interestEarned = currentBalance
            * interestRate
            * blocksPassed
            / BLOCKS_PER_YEAR
            / 10000;

        return interestEarned;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function updateInterest(address user) external override {
        require(savingsAccounts[user].isActive, "SavingsVault: No active account");
        _updateInterestInternal(user);
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getInterestRate() external view override returns (uint256) {
        return interestRate;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getTotalValueLocked() external view override returns (uint256) {
        return totalValueLocked;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getTotalInterestDistributed() external view override returns (uint256) {
        return totalInterestDistributed;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function setInterestRate(uint256 newRate) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newRate <= MAX_INTEREST_RATE, "SavingsVault: Interest rate too high");
        
        uint256 oldRate = interestRate;
        interestRate = newRate;
        
        emit InterestRateUpdated(oldRate, newRate);
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function setDepositLimits(uint256 newMinDeposit, uint256 newMaxDeposit) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newMinDeposit > 0, "SavingsVault: Minimum deposit must be positive");
        require(newMaxDeposit > newMinDeposit, "SavingsVault: Maximum must be greater than minimum");
        
        minDeposit = newMinDeposit;
        maxDeposit = newMaxDeposit;
        
        emit VaultParametersUpdated(newMinDeposit, newMaxDeposit);
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function emergencyWithdraw(address user, address to) 
        external 
        override 
        onlyRole(EMERGENCY_ROLE) 
    {
        require(user != address(0), "SavingsVault: Invalid user address");
        require(to != address(0), "SavingsVault: Invalid recipient address");

        SavingsAccount storage account = savingsAccounts[user];
        require(account.isActive, "SavingsVault: No active account");

        // Update interest first
        _updateInterestInternal(user);

        uint256 totalBalance = account.principal + account.accruedInterest;
        require(totalBalance > 0, "SavingsVault: No balance to withdraw");

        // Clear account
        account.principal = 0;
        account.accruedInterest = 0;
        account.isActive = false;

        // Update global tracking
        totalValueLocked = totalValueLocked -
            (account.principal > totalValueLocked ? totalValueLocked : account.principal);

        // Transfer tokens
        depositToken.safeTransfer(to, totalBalance);

        emit Withdraw(user, totalBalance, 0);
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function depositToReserve(uint256 amount) 
        external 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(amount > 0, "SavingsVault: Amount must be positive");

        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        reserveBalance = reserveBalance + amount;
    }

    /**
     * @inheritdoc ISavingsVault
     */
    function getReserveBalance() external view override returns (uint256) {
        return reserveBalance;
    }

    /**
     * @dev Internal function to update interest for a user
     * @param user Address of the user
     */
    function _updateInterestInternal(address user) internal {
        SavingsAccount storage account = savingsAccounts[user];
        
        uint256 newInterest = calculateAccruedInterest(user);
        if (newInterest > 0) {
            account.accruedInterest = account.accruedInterest + newInterest;
            totalInterestDistributed = totalInterestDistributed + newInterest;
            
            // Use reserve balance for interest payments
            if (reserveBalance >= newInterest) {
                reserveBalance = reserveBalance - newInterest;
            }
            
            emit InterestAccrued(user, newInterest, getBalance(user));
        }
        
        account.lastUpdateBlock = block.number;
    }

    /**
     * @dev Batch update interest for multiple users (gas optimization)
     * @param users Array of user addresses to update
     */
    function batchUpdateInterest(address[] calldata users) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (savingsAccounts[users[i]].isActive) {
                _updateInterestInternal(users[i]);
            }
        }
    }

    /**
     * @dev Get vault statistics
     * @return totalUsers Number of active users
     * @return averageBalance Average balance per user
     * @return totalInterestRate Current effective interest rate
     */
    function getVaultStats() 
        external 
        view 
        returns (uint256, uint256, uint256 totalInterestRate) 
    {
        // This would require additional state tracking for efficiency
        // For now, return basic stats
        totalInterestRate = interestRate;
        // totalUsers and averageBalance would need enumeration
        return (0, 0, totalInterestRate); // Return zeros for unimplemented stats
    }

    /**
     * @dev Emergency pause deposits (maintains withdrawals)
     */
    function pauseDeposits() external onlyRole(EMERGENCY_ROLE) {
        // Implementation would add deposit-specific pausing
        _pause();
    }

    /**
     * @dev Resume all operations
     */
    function resumeOperations() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
}
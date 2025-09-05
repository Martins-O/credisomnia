// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILendingPool
 * @dev Interface for the Lending Pool contract with dynamic collateral ratios
 * @author Credisomnia Team
 */
interface ILendingPool {
    /// @dev Emitted when liquidity is supplied
    event LiquiditySupplied(address indexed supplier, uint256 amount, uint256 newTotalSupply);
    
    /// @dev Emitted when liquidity is withdrawn
    event LiquidityWithdrawn(address indexed supplier, uint256 amount, uint256 newTotalSupply);
    
    /// @dev Emitted when a loan is issued
    event LoanIssued(
        uint256 indexed loanId, 
        address indexed borrower, 
        uint256 amount, 
        uint256 collateralAmount,
        uint256 interestRate,
        uint256 dueDate
    );
    
    /// @dev Emitted when a loan is repaid
    event LoanRepaid(
        uint256 indexed loanId, 
        address indexed borrower, 
        uint256 amount, 
        uint256 interestAmount,
        bool fullyRepaid
    );
    
    /// @dev Emitted when a loan defaults
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 collateralSeized);
    
    /// @dev Emitted when a loan is liquidated
    event LoanLiquidated(
        uint256 indexed loanId, 
        address indexed liquidator, 
        uint256 collateralAmount,
        uint256 liquidationBonus
    );

    enum LoanStatus {
        None,       // No loan exists
        Active,     // Loan is active
        Repaid,     // Loan fully repaid
        Defaulted,  // Loan has defaulted
        Liquidated  // Loan has been liquidated
    }

    struct Loan {
        uint256 loanId;             // Unique loan identifier
        address borrower;           // Address of the borrower
        uint256 principalAmount;    // Original loan amount
        uint256 outstandingAmount;  // Remaining amount to repay
        uint256 collateralAmount;   // Collateral provided
        uint256 interestRate;       // Annual interest rate in basis points
        uint256 startTimestamp;     // When loan was issued
        uint256 dueTimestamp;       // When loan is due
        uint256 lastPaymentTime;    // Last payment timestamp
        LoanStatus status;          // Current loan status
    }

    struct SupplierInfo {
        uint256 totalSupplied;      // Total amount supplied
        uint256 totalEarned;        // Total interest earned
        uint256 lastSupplyTime;     // Last supply timestamp
        uint256 availableToWithdraw; // Available for withdrawal
    }

    /**
     * @dev Supplies liquidity to the lending pool
     * @param amount Amount to supply
     */
    function supplyLiquidity(uint256 amount) external;

    /**
     * @dev Withdraws liquidity from the lending pool
     * @param amount Amount to withdraw (0 for max available)
     */
    function withdrawLiquidity(uint256 amount) external;

    /**
     * @dev Requests a loan with collateral
     * @param loanAmount Amount to borrow
     * @param collateralAmount Collateral to provide
     * @param loanDuration Duration of loan in seconds
     * @return loanId The ID of the created loan
     */
    function requestLoan(
        uint256 loanAmount,
        uint256 collateralAmount,
        uint256 loanDuration
    ) external returns (uint256 loanId);

    /**
     * @dev Repays a loan (partial or full)
     * @param loanId ID of the loan to repay
     * @param amount Amount to repay (0 for full repayment)
     */
    function repayLoan(uint256 loanId, uint256 amount) external;

    /**
     * @dev Liquidates a loan that has exceeded liquidation threshold
     * @param loanId ID of the loan to liquidate
     */
    function liquidateLoan(uint256 loanId) external;

    /**
     * @dev Gets loan details
     * @param loanId ID of the loan
     * @return Loan struct
     */
    function getLoan(uint256 loanId) external view returns (Loan memory);

    /**
     * @dev Gets all loans for a borrower
     * @param borrower Address of the borrower
     * @return Array of loan IDs
     */
    function getUserLoans(address borrower) external view returns (uint256[] memory);

    /**
     * @dev Gets supplier information
     * @param supplier Address of the supplier
     * @return Supplier information struct
     */
    function getSupplierInfo(address supplier) external view returns (SupplierInfo memory);

    /**
     * @dev Calculates current interest owed on a loan
     * @param loanId ID of the loan
     * @return Interest amount owed
     */
    function calculateInterestOwed(uint256 loanId) external view returns (uint256);

    /**
     * @dev Calculates the health factor of a loan
     * @param loanId ID of the loan
     * @return Health factor (1e18 = 100%, below liquidation threshold triggers liquidation)
     */
    function calculateHealthFactor(uint256 loanId) external view returns (uint256);

    /**
     * @dev Checks if a loan is eligible for liquidation
     * @param loanId ID of the loan
     * @return True if loan can be liquidated
     */
    function isLiquidatable(uint256 loanId) external view returns (bool);

    /**
     * @dev Gets the total amount available for borrowing
     * @return Available liquidity in the pool
     */
    function getAvailableLiquidity() external view returns (uint256);

    /**
     * @dev Gets the total value locked in the pool
     * @return Total value locked (supplied + earned interest)
     */
    function getTotalValueLocked() external view returns (uint256);

    /**
     * @dev Gets the current utilization rate of the pool
     * @return Utilization rate in basis points
     */
    function getUtilizationRate() external view returns (uint256);

    /**
     * @dev Updates pool parameters (admin only)
     * @param newLiquidationThreshold New liquidation threshold
     * @param newLiquidationBonus New liquidation bonus
     * @param newMaxLoanDuration Maximum loan duration
     */
    function updatePoolParameters(
        uint256 newLiquidationThreshold,
        uint256 newLiquidationBonus,
        uint256 newMaxLoanDuration
    ) external;

    /**
     * @dev Emergency function to pause all lending operations (admin only)
     */
    function pauseLending() external;

    /**
     * @dev Resume lending operations (admin only)
     */
    function resumeLending() external;
}
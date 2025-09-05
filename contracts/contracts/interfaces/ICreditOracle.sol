// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICreditOracle
 * @dev Interface for the Credit Oracle contract
 * @author Credisomnia Team
 */
interface ICreditOracle {
    /// @dev Emitted when a user's credit score is updated
    event CreditScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    
    /// @dev Emitted when repayment history is recorded
    event RepaymentRecorded(address indexed user, uint256 amount, bool onTime);
    
    /// @dev Emitted when savings activity is recorded
    event SavingsActivityRecorded(address indexed user, uint256 amount, bool isDeposit);
    
    /// @dev Emitted when staking activity is recorded
    event StakingActivityRecorded(address indexed user, uint256 amount, uint256 duration);

    struct CreditProfile {
        uint256 creditScore;           // Current credit score (300-850)
        uint256 totalRepayments;       // Total amount repaid
        uint256 onTimeRepayments;      // Number of on-time repayments
        uint256 lateRepayments;        // Number of late repayments
        uint256 totalSavings;          // Total savings deposited
        uint256 totalStaked;           // Total amount staked
        uint256 lastScoreUpdate;       // Timestamp of last score update
        uint256 repaymentStreak;       // Current streak of on-time payments
        bool isInitialized;            // Whether profile is initialized
    }

    /**
     * @dev Gets the credit score for a user
     * @param user Address of the user
     * @return Credit score (300-850)
     */
    function getCreditScore(address user) external view returns (uint256);

    /**
     * @dev Gets the complete credit profile for a user
     * @param user Address of the user
     * @return Credit profile struct
     */
    function getCreditProfile(address user) external view returns (CreditProfile memory);

    /**
     * @dev Records a repayment and updates credit score
     * @param user Address of the borrower
     * @param amount Amount repaid
     * @param onTime Whether the repayment was on time
     */
    function recordRepayment(address user, uint256 amount, bool onTime) external;

    /**
     * @dev Records savings activity and updates credit score
     * @param user Address of the saver
     * @param amount Amount deposited or withdrawn
     * @param isDeposit Whether this is a deposit (true) or withdrawal (false)
     */
    function recordSavingsActivity(address user, uint256 amount, bool isDeposit) external;

    /**
     * @dev Records staking activity and updates credit score
     * @param user Address of the staker
     * @param amount Amount staked
     * @param duration Staking duration in seconds
     */
    function recordStakingActivity(address user, uint256 amount, uint256 duration) external;

    /**
     * @dev Calculates the required collateral ratio based on credit score
     * @param user Address of the borrower
     * @param loanAmount Amount to borrow
     * @return Required collateral amount
     */
    function calculateCollateralRequirement(address user, uint256 loanAmount) external view returns (uint256);

    /**
     * @dev Checks if a user is eligible for a loan
     * @param user Address of the potential borrower
     * @param loanAmount Amount requested
     * @return eligible Whether the user is eligible
     * @return reason Reason if not eligible
     */
    function checkLoanEligibility(address user, uint256 loanAmount) 
        external 
        view 
        returns (bool eligible, string memory reason);

    /**
     * @dev Updates credit score calculation parameters (admin only)
     * @param newMinScore New minimum credit score
     * @param newMaxScore New maximum credit score
     * @param newBaseCollateralRatio New base collateral ratio
     */
    function updateScoringParameters(
        uint256 newMinScore,
        uint256 newMaxScore,
        uint256 newBaseCollateralRatio
    ) external;
}
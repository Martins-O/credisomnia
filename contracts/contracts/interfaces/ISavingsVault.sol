// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISavingsVault
 * @dev Interface for the Savings Vault contract with real-time interest accrual
 * @author Credisomnia Team
 */
interface ISavingsVault {
    /// @dev Emitted when a user deposits funds
    event Deposit(address indexed user, uint256 amount, uint256 newBalance);
    
    /// @dev Emitted when a user withdraws funds
    event Withdraw(address indexed user, uint256 amount, uint256 newBalance);
    
    /// @dev Emitted when interest is accrued
    event InterestAccrued(address indexed user, uint256 interestAmount, uint256 newBalance);
    
    /// @dev Emitted when interest rate is updated
    event InterestRateUpdated(uint256 oldRate, uint256 newRate);
    
    /// @dev Emitted when vault parameters are updated
    event VaultParametersUpdated(uint256 minDeposit, uint256 maxDeposit);

    struct SavingsAccount {
        uint256 principal;              // Original deposit amount
        uint256 accruedInterest;        // Interest accrued so far
        uint256 lastUpdateBlock;        // Last block when interest was calculated
        uint256 depositTimestamp;       // When the account was created
        bool isActive;                  // Whether the account is active
    }

    /**
     * @dev Deposits funds into the savings vault
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external;

    /**
     * @dev Withdraws funds from the savings vault
     * @param amount Amount to withdraw (0 for full balance)
     */
    function withdraw(uint256 amount) external;

    /**
     * @dev Calculates the current balance including accrued interest
     * @param user Address of the user
     * @return Total balance (principal + interest)
     */
    function getBalance(address user) external view returns (uint256);

    /**
     * @dev Gets the savings account details for a user
     * @param user Address of the user
     * @return Savings account struct
     */
    function getSavingsAccount(address user) external view returns (SavingsAccount memory);

    /**
     * @dev Calculates accrued interest for a user without updating state
     * @param user Address of the user
     * @return Amount of interest accrued since last update
     */
    function calculateAccruedInterest(address user) external view returns (uint256);

    /**
     * @dev Updates interest for a user (called automatically on deposits/withdrawals)
     * @param user Address of the user
     */
    function updateInterest(address user) external;

    /**
     * @dev Gets the current interest rate
     * @return Annual interest rate in basis points (e.g., 500 = 5%)
     */
    function getInterestRate() external view returns (uint256);

    /**
     * @dev Gets the total value locked in the vault
     * @return Total amount deposited across all users
     */
    function getTotalValueLocked() external view returns (uint256);

    /**
     * @dev Gets the total interest distributed
     * @return Total interest paid to all users
     */
    function getTotalInterestDistributed() external view returns (uint256);

    /**
     * @dev Sets a new interest rate (admin only)
     * @param newRate New annual interest rate in basis points
     */
    function setInterestRate(uint256 newRate) external;

    /**
     * @dev Sets minimum and maximum deposit amounts (admin only)
     * @param minDeposit Minimum deposit amount
     * @param maxDeposit Maximum deposit amount
     */
    function setDepositLimits(uint256 minDeposit, uint256 maxDeposit) external;

    /**
     * @dev Emergency withdrawal function (admin only)
     * @param user Address of the user
     * @param to Address to send funds to
     */
    function emergencyWithdraw(address user, address to) external;

    /**
     * @dev Deposits funds to the vault's reserve (admin only)
     * Used to ensure the vault has enough funds to pay interest
     * @param amount Amount to deposit to reserves
     */
    function depositToReserve(uint256 amount) external;

    /**
     * @dev Gets the vault's reserve balance
     * @return Reserve balance available for interest payments
     */
    function getReserveBalance() external view returns (uint256);
}
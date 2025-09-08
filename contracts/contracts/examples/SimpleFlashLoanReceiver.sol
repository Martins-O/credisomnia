// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IFlashLoanReceiver.sol";
import "../interfaces/ILendingPool.sol";

/**
 * @title SimpleFlashLoanReceiver
 * @dev Example implementation of a flash loan receiver
 * @author Credisomnia Team
 * @notice This is a simple example for demonstration purposes
 */
contract SimpleFlashLoanReceiver is IFlashLoanReceiver {
    using SafeERC20 for IERC20;
    
    ILendingPool public immutable lendingPool;
    
    event FlashLoanExecuted(address asset, uint256 amount, uint256 premium);
    
    constructor(address _lendingPool) {
        require(_lendingPool != address(0), "SimpleFlashLoanReceiver: Invalid lending pool");
        lendingPool = ILendingPool(_lendingPool);
    }
    
    /**
     * @dev Execute operation to receive flash loan
     * @param asset The flash loaned asset
     * @param amount The amount of the flash loan
     * @param premium The fee charged for the flash loan
     * @param initiator The address that initiated the flash loan
     * @param params Additional parameters (unused in this simple example)
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Verify that the call is from the lending pool
        require(msg.sender == address(lendingPool), "SimpleFlashLoanReceiver: Unauthorized");
        
        // At this point, the contract has received the flash loan amount
        uint256 balance = IERC20(asset).balanceOf(address(this));
        require(balance >= amount, "SimpleFlashLoanReceiver: Insufficient balance received");
        
        // === CUSTOM LOGIC GOES HERE ===
        // This is where you would implement your arbitrage, liquidation,
        // or other DeFi strategies using the flash loaned amount
        
        // For this simple example, we'll just emit an event
        emit FlashLoanExecuted(asset, amount, premium);
        
        // In a real scenario, you would:
        // 1. Use the flash loaned amount for arbitrage/liquidation/etc.
        // 2. Generate profit to cover the premium
        // 3. Ensure you have amount + premium in the contract
        
        // === REPAYMENT LOGIC ===
        // Calculate total amount to repay
        uint256 totalRepayment = amount + premium;
        
        // Ensure we have enough balance to repay (including premium)
        require(
            IERC20(asset).balanceOf(address(this)) >= totalRepayment,
            "SimpleFlashLoanReceiver: Insufficient balance for repayment"
        );
        
        // Transfer the repayment back to the lending pool
        IERC20(asset).safeTransfer(address(lendingPool), totalRepayment);
        
        return true;
    }
    
    /**
     * @dev Initiates a flash loan
     * @param asset Address of the asset to borrow
     * @param amount Amount to borrow
     */
    function requestFlashLoan(address asset, uint256 amount) external {
        bytes memory params = ""; // No additional parameters needed for this simple example
        lendingPool.flashLoan(address(this), asset, amount, params);
    }
    
    /**
     * @dev Emergency function to withdraw any tokens stuck in the contract
     * @param token Token address to withdraw
     * @param to Address to send tokens to
     */
    function emergencyTokenWithdraw(address token, address to) external {
        require(to != address(0), "SimpleFlashLoanReceiver: Invalid recipient");
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(to, balance);
        }
    }
    
    /**
     * @dev Allow contract to receive ETH (if needed for strategies)
     */
    receive() external payable {}
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFlashLoanReceiver
 * @dev Interface for flash loan receivers
 * @author Credisomnia Team
 */
interface IFlashLoanReceiver {
    /**
     * @dev Called by the lending pool during flash loan execution
     * @param asset The flash loaned asset
     * @param amount The amount of the flash loan
     * @param premium The fee charged for the flash loan
     * @param initiator The address that initiated the flash loan
     * @param params Additional parameters passed from the initiator
     * @return True if the operation was successful
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICredisomniaSecurity
 * @dev Interface for security mechanisms across all Credisomnia contracts
 * @author Credisomnia Team
 */
interface ICredisomniaSecurity {
    /// @dev Emitted when circuit breaker is activated
    event CircuitBreakerActivated(address indexed activator, string reason);
    
    /// @dev Emitted when circuit breaker is deactivated
    event CircuitBreakerDeactivated(address indexed deactivator);
    
    /// @dev Emitted when daily volume limit is exceeded
    event DailyVolumeLimitExceeded(uint256 attempted, uint256 limit);
    
    /// @dev Emitted when suspicious activity is detected
    event SuspiciousActivityDetected(address indexed user, string activity);

    /**
     * @dev Activates the circuit breaker to halt all operations
     * @param reason Reason for activation
     */
    function activateCircuitBreaker(string calldata reason) external;

    /**
     * @dev Deactivates the circuit breaker to resume operations
     */
    function deactivateCircuitBreaker() external;

    /**
     * @dev Checks if circuit breaker is active
     * @return true if circuit breaker is active
     */
    function isCircuitBreakerActive() external view returns (bool);

    /**
     * @dev Checks if an operation is within daily volume limits
     * @param amount Amount to check
     * @return true if within limits
     */
    function isWithinDailyVolumeLimit(uint256 amount) external view returns (bool);

    /**
     * @dev Gets the current daily volume usage
     * @return Current volume used today
     */
    function getDailyVolumeUsed() external view returns (uint256);
}
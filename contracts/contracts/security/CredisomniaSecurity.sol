// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/ICredisomniaSecurity.sol";

/**
 * @title CredisomniaSecurity
 * @dev Base security contract implementing circuit breakers, volume limits, and access controls
 * @author Credisomnia Team
 */
abstract contract CredisomniaSecurity is 
    Pausable, 
    ReentrancyGuard, 
    AccessControl, 
    ICredisomniaSecurity 
{
    /// @dev Role for emergency pause operations
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    /// @dev Role for security operations
    bytes32 public constant SECURITY_ROLE = keccak256("SECURITY_ROLE");

    /// @dev Maximum daily volume allowed
    uint256 public maxDailyVolume;
    
    /// @dev Current daily volume used
    uint256 public dailyVolumeUsed;
    
    /// @dev Last volume reset timestamp
    uint256 public lastVolumeReset;
    
    /// @dev Circuit breaker status
    bool private _circuitBreakerActive;

    /// @dev Mapping to track user activity patterns
    mapping(address => uint256) public userLastActivity;
    mapping(address => uint256) public userDailyVolume;

    modifier onlyWhenNotPaused() {
        require(!paused() && !_circuitBreakerActive, "CredisomniaSecurity: Operations halted");
        _;
    }

    modifier withinVolumeLimit(uint256 amount) {
        require(isWithinDailyVolumeLimit(amount), "CredisomniaSecurity: Daily volume limit exceeded");
        _;
    }

    modifier onlySecurity() {
        require(hasRole(SECURITY_ROLE, msg.sender), "CredisomniaSecurity: Caller is not security role");
        _;
    }

    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "CredisomniaSecurity: Caller is not emergency role");
        _;
    }

    /**
     * @dev Constructor sets up roles and initial parameters
     * @param admin Address to receive admin role
     * @param emergencyAddress Address to receive emergency role
     * @param securityAddress Address to receive security role
     * @param _maxDailyVolume Maximum daily volume limit
     */
    constructor(
        address admin,
        address emergencyAddress,
        address securityAddress,
        uint256 _maxDailyVolume
    ) {
        require(admin != address(0), "CredisomniaSecurity: Admin cannot be zero address");
        require(emergencyAddress != address(0), "CredisomniaSecurity: Emergency address cannot be zero");
        require(securityAddress != address(0), "CredisomniaSecurity: Security address cannot be zero");
        require(_maxDailyVolume > 0, "CredisomniaSecurity: Max daily volume must be positive");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, emergencyAddress);
        _grantRole(SECURITY_ROLE, securityAddress);
        
        maxDailyVolume = _maxDailyVolume;
        lastVolumeReset = block.timestamp;
    }

    /**
     * @inheritdoc ICredisomniaSecurity
     */
    function activateCircuitBreaker(string calldata reason) 
        external 
        override 
        onlyEmergency 
    {
        _circuitBreakerActive = true;
        _pause();
        emit CircuitBreakerActivated(msg.sender, reason);
    }

    /**
     * @inheritdoc ICredisomniaSecurity
     */
    function deactivateCircuitBreaker() external override onlyEmergency {
        _circuitBreakerActive = false;
        _unpause();
        emit CircuitBreakerDeactivated(msg.sender);
    }

    /**
     * @inheritdoc ICredisomniaSecurity
     */
    function isCircuitBreakerActive() external view override returns (bool) {
        return _circuitBreakerActive;
    }

    /**
     * @inheritdoc ICredisomniaSecurity
     */
    function isWithinDailyVolumeLimit(uint256 amount) public view override returns (bool) {
        uint256 currentVolume = block.timestamp >= lastVolumeReset + 1 days ? 0 : dailyVolumeUsed;
        return currentVolume + amount <= maxDailyVolume;
    }

    /**
     * @inheritdoc ICredisomniaSecurity
     */
    function getDailyVolumeUsed() external view override returns (uint256) {
        return block.timestamp >= lastVolumeReset + 1 days ? 0 : dailyVolumeUsed;
    }

    /**
     * @dev Updates daily volume and user activity tracking
     * @param user Address of the user
     * @param amount Amount to add to volume
     */
    function _updateVolumeTracking(address user, uint256 amount) internal {
        _resetDailyVolumeIfNeeded();
        
        dailyVolumeUsed += amount;
        userDailyVolume[user] += amount;
        userLastActivity[user] = block.timestamp;

        // Check for suspicious activity patterns
        if (userDailyVolume[user] > maxDailyVolume / 10) { // More than 10% of daily limit
            emit SuspiciousActivityDetected(user, "High daily volume");
        }
    }

    /**
     * @dev Resets daily volume counters if a new day has started
     */
    function _resetDailyVolumeIfNeeded() internal {
        if (block.timestamp >= lastVolumeReset + 1 days) {
            dailyVolumeUsed = 0;
            lastVolumeReset = block.timestamp;
            // Note: Individual user volumes would need enumeration to reset efficiently
            // For production, consider using a time-based mapping approach
        }
    }


    /**
     * @dev Updates the maximum daily volume limit
     * @param newLimit New maximum daily volume
     */
    function setMaxDailyVolume(uint256 newLimit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newLimit > 0, "CredisomniaSecurity: Max daily volume must be positive");
        maxDailyVolume = newLimit;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyEmergency {
        _pause();
    }

    /**
     * @dev Emergency unpause function
     */
    function emergencyUnpause() external onlyEmergency {
        _unpause();
    }
}
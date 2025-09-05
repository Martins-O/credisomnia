// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ICreditOracle.sol";
import "./security/CredisomniaSecurity.sol";

/**
 * @title CreditOracle
 * @dev Tracks user credit history and calculates dynamic credit scores
 * @author Credisomnia Team
 * @custom:security-contact security@credisomnia.com
 */
contract CreditOracle is ICreditOracle, CredisomniaSecurity {

    /// @dev Authorized contracts that can update credit scores
    mapping(address => bool) public authorizedContracts;
    
    /// @dev User credit profiles
    mapping(address => CreditProfile) public creditProfiles;
    
    /// @dev Credit scoring parameters
    uint256 public constant MIN_CREDIT_SCORE = 300;
    uint256 public constant MAX_CREDIT_SCORE = 850;
    uint256 public constant INITIAL_CREDIT_SCORE = 600;
    
    /// @dev Scoring weights (in basis points, 10000 = 100%)
    uint256 public repaymentWeight = 4000;      // 40% weight for repayment history
    uint256 public savingsWeight = 2000;        // 20% weight for savings activity
    uint256 public stakingWeight = 1500;        // 15% weight for staking activity
    uint256 public streakWeight = 1500;         // 15% weight for repayment streaks
    uint256 public consistencyWeight = 1000;    // 10% weight for consistency
    
    /// @dev Collateral ratio parameters
    uint256 public baseCollateralRatio = 15000;  // 150% base collateral ratio
    uint256 public maxCollateralRatio = 20000;   // 200% max collateral ratio
    uint256 public minCollateralRatio = 11000;   // 110% min collateral ratio (for excellent credit)
    
    /// @dev Time constants
    uint256 public constant SCORE_UPDATE_COOLDOWN = 1 hours;
    uint256 public constant STREAK_RESET_THRESHOLD = 30 days;

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "CreditOracle: Caller not authorized"
        );
        _;
    }

    modifier validCreditScore(uint256 score) {
        require(
            score >= MIN_CREDIT_SCORE && score <= MAX_CREDIT_SCORE,
            "CreditOracle: Invalid credit score"
        );
        _;
    }

    /**
     * @dev Constructor initializes the credit oracle with security parameters
     * @param admin Address to receive admin role
     * @param emergencyAddress Address for emergency operations
     * @param securityAddress Address for security operations  
     * @param maxDailyVolume Maximum daily volume for security
     */
    constructor(
        address admin,
        address emergencyAddress,
        address securityAddress,
        uint256 maxDailyVolume
    ) CredisomniaSecurity(admin, emergencyAddress, securityAddress, maxDailyVolume) {
        // Additional initialization can be added here
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function getCreditScore(address user) external view override returns (uint256) {
        CreditProfile storage profile = creditProfiles[user];
        if (!profile.isInitialized) {
            return INITIAL_CREDIT_SCORE;
        }
        return profile.creditScore;
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function getCreditProfile(address user) external view override returns (CreditProfile memory) {
        return creditProfiles[user];
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function recordRepayment(address user, uint256 amount, bool onTime) 
        external 
        override 
        onlyAuthorized 
        onlyWhenNotPaused 
        withinVolumeLimit(amount)
    {
        require(user != address(0), "CreditOracle: Invalid user address");
        require(amount > 0, "CreditOracle: Amount must be positive");

        CreditProfile storage profile = creditProfiles[user];
        _initializeProfileIfNeeded(user);

        // Update repayment history
        profile.totalRepayments = profile.totalRepayments + amount;
        
        if (onTime) {
            profile.onTimeRepayments = profile.onTimeRepayments + 1;
            profile.repaymentStreak = profile.repaymentStreak + 1;
        } else {
            profile.lateRepayments = profile.lateRepayments + 1;
            profile.repaymentStreak = 0; // Reset streak
        }

        // Update credit score
        _updateCreditScore(user);
        _updateVolumeTracking(user, amount);

        emit RepaymentRecorded(user, amount, onTime);
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function recordSavingsActivity(address user, uint256 amount, bool isDeposit) 
        external 
        override 
        onlyAuthorized 
        onlyWhenNotPaused 
        withinVolumeLimit(amount)
    {
        require(user != address(0), "CreditOracle: Invalid user address");
        require(amount > 0, "CreditOracle: Amount must be positive");

        CreditProfile storage profile = creditProfiles[user];
        _initializeProfileIfNeeded(user);

        // Update savings activity
        if (isDeposit) {
            profile.totalSavings = profile.totalSavings + amount;
        } else {
            // Ensure we don't underflow
            if (profile.totalSavings >= amount) {
                profile.totalSavings = profile.totalSavings - amount;
            }
        }

        // Update credit score
        _updateCreditScore(user);
        _updateVolumeTracking(user, amount);

        emit SavingsActivityRecorded(user, amount, isDeposit);
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function recordStakingActivity(address user, uint256 amount, uint256 duration) 
        external 
        override 
        onlyAuthorized 
        onlyWhenNotPaused 
        withinVolumeLimit(amount)
    {
        require(user != address(0), "CreditOracle: Invalid user address");
        require(amount > 0, "CreditOracle: Amount must be positive");
        require(duration > 0, "CreditOracle: Duration must be positive");

        CreditProfile storage profile = creditProfiles[user];
        _initializeProfileIfNeeded(user);

        // Weight staking by duration (longer stakes are better for credit)
        uint256 weightedStaking = amount * duration / 365 days;
        profile.totalStaked = profile.totalStaked + weightedStaking;

        // Update credit score
        _updateCreditScore(user);
        _updateVolumeTracking(user, amount);

        emit StakingActivityRecorded(user, amount, duration);
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function calculateCollateralRequirement(address user, uint256 loanAmount) 
        external 
        view 
        override 
        returns (uint256) 
    {
        uint256 creditScore = this.getCreditScore(user);
        
        // Calculate collateral ratio based on credit score
        // Higher credit score = lower collateral requirement
        uint256 scoreRange = MAX_CREDIT_SCORE - MIN_CREDIT_SCORE;
        uint256 userScoreFromMin = creditScore - MIN_CREDIT_SCORE;
        
        // Linear interpolation between max and min collateral ratios
        uint256 ratioRange = maxCollateralRatio - minCollateralRatio;
        uint256 ratioReduction = ratioRange * userScoreFromMin / scoreRange;
        uint256 collateralRatio = maxCollateralRatio - ratioReduction;
        
        return loanAmount * collateralRatio / 10000;
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function checkLoanEligibility(address user, uint256 loanAmount) 
        external 
        view 
        override 
        returns (bool eligible, string memory reason) 
    {
        if (user == address(0)) {
            return (false, "Invalid user address");
        }

        if (loanAmount == 0) {
            return (false, "Loan amount must be positive");
        }

        uint256 creditScore = this.getCreditScore(user);
        
        // Minimum credit score requirement
        if (creditScore < 400) {
            return (false, "Credit score too low");
        }
        
        CreditProfile storage profile = creditProfiles[user];
        
        // Check for recent late payments (last 30 days)
        if (profile.lateRepayments > 0 && profile.repaymentStreak == 0) {
            uint256 timeSinceLastUpdate = block.timestamp - profile.lastScoreUpdate;
            if (timeSinceLastUpdate < 30 days) {
                return (false, "Recent late payments detected");
            }
        }
        
        return (true, "Eligible for loan");
    }

    /**
     * @inheritdoc ICreditOracle
     */
    function updateScoringParameters(
        uint256 newMinScore,
        uint256 newMaxScore,
        uint256 newBaseCollateralRatio
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMinScore < newMaxScore, "CreditOracle: Invalid score range");
        require(newBaseCollateralRatio >= 10000, "CreditOracle: Collateral ratio too low");
        
        // Update would require storage variables for these constants
        // For now, this is a placeholder for parameter updates
        baseCollateralRatio = newBaseCollateralRatio;
    }

    /**
     * @dev Authorizes a contract to update credit scores
     * @param contractAddress Address of the contract to authorize
     * @param authorized Whether the contract is authorized
     */
    function setAuthorizedContract(address contractAddress, bool authorized) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(contractAddress != address(0), "CreditOracle: Invalid contract address");
        authorizedContracts[contractAddress] = authorized;
    }

    /**
     * @dev Initializes a credit profile if it doesn't exist
     * @param user Address of the user
     */
    function _initializeProfileIfNeeded(address user) internal {
        CreditProfile storage profile = creditProfiles[user];
        if (!profile.isInitialized) {
            profile.creditScore = INITIAL_CREDIT_SCORE;
            profile.lastScoreUpdate = block.timestamp;
            profile.isInitialized = true;
        }
    }

    /**
     * @dev Calculates and updates the credit score for a user
     * @param user Address of the user
     */
    function _updateCreditScore(address user) internal {
        CreditProfile storage profile = creditProfiles[user];
        
        // Prevent too frequent updates
        if (block.timestamp < profile.lastScoreUpdate + SCORE_UPDATE_COOLDOWN) {
            return;
        }

        uint256 oldScore = profile.creditScore;
        uint256 newScore = _calculateCreditScore(profile);
        
        profile.creditScore = newScore;
        profile.lastScoreUpdate = block.timestamp;

        emit CreditScoreUpdated(user, oldScore, newScore);
    }

    /**
     * @dev Calculates credit score based on profile data
     * @param profile The user's credit profile
     * @return Calculated credit score
     */
    function _calculateCreditScore(CreditProfile storage profile) internal view returns (uint256) {
        uint256 totalRepayments = profile.onTimeRepayments + profile.lateRepayments;
        
        // Start with base score
        uint256 score = INITIAL_CREDIT_SCORE;
        
        // Repayment history component
        if (totalRepayments > 0) {
            uint256 repaymentRatio = profile.onTimeRepayments * 10000 / totalRepayments;
            uint256 repaymentScore = MIN_CREDIT_SCORE + (
                repaymentRatio * (MAX_CREDIT_SCORE - MIN_CREDIT_SCORE) / 10000
            );
            score = score + (repaymentScore * repaymentWeight / 10000);
        }
        
        // Savings component (normalized to reasonable range)
        uint256 savingsScore = profile.totalSavings > 0 ? 
            MIN_CREDIT_SCORE + 50 : MIN_CREDIT_SCORE; // Cap the boost
        score = score + (savingsScore * savingsWeight / 10000);
        
        // Staking component
        uint256 stakingScore = profile.totalStaked > 0 ? 
            MIN_CREDIT_SCORE + 30 : MIN_CREDIT_SCORE;
        score = score + (stakingScore * stakingWeight / 10000);
        
        // Repayment streak bonus
        uint256 streakBonus = profile.repaymentStreak > 5 ? 
            profile.repaymentStreak * 2 : 0; // 2 points per streak
        score = score + (streakBonus * streakWeight / 10000);
        
        // Ensure score is within bounds
        if (score < MIN_CREDIT_SCORE) score = MIN_CREDIT_SCORE;
        if (score > MAX_CREDIT_SCORE) score = MAX_CREDIT_SCORE;
        
        return score;
    }

    /**
     * @dev Updates scoring weights (admin only)
     * @param _repaymentWeight New repayment weight
     * @param _savingsWeight New savings weight
     * @param _stakingWeight New staking weight
     * @param _streakWeight New streak weight
     * @param _consistencyWeight New consistency weight
     */
    function updateScoringWeights(
        uint256 _repaymentWeight,
        uint256 _savingsWeight,
        uint256 _stakingWeight,
        uint256 _streakWeight,
        uint256 _consistencyWeight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _repaymentWeight + _savingsWeight + _stakingWeight
                + _streakWeight + _consistencyWeight == 10000,
            "CreditOracle: Weights must sum to 100%"
        );
        
        repaymentWeight = _repaymentWeight;
        savingsWeight = _savingsWeight;
        stakingWeight = _stakingWeight;
        streakWeight = _streakWeight;
        consistencyWeight = _consistencyWeight;
    }
}
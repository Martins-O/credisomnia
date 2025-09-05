const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CreditOracle", function () {
  let CreditOracle, creditOracle;
  let MockToken, mockToken;
  let owner, admin, emergency, security, user1, user2, authorizedContract;
  
  const INITIAL_CREDIT_SCORE = 600;
  const MIN_CREDIT_SCORE = 300;
  const MAX_CREDIT_SCORE = 850;
  const MAX_DAILY_VOLUME = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, admin, emergency, security, user1, user2, authorizedContract] = await ethers.getSigners();

    // Deploy mock token for volume tracking
    MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MOCK", ethers.parseEther("1000000"), 18);
    await mockToken.waitForDeployment();

    // Deploy CreditOracle
    CreditOracle = await ethers.getContractFactory("CreditOracle");
    creditOracle = await CreditOracle.deploy(
      admin.address,
      emergency.address,
      security.address,
      MAX_DAILY_VOLUME
    );
    await creditOracle.waitForDeployment();

    // Authorize a contract for testing
    await creditOracle.connect(admin).setAuthorizedContract(authorizedContract.address, true);
  });

  describe("Deployment", function () {
    it("Should set the correct admin role", async function () {
      const adminRole = await creditOracle.DEFAULT_ADMIN_ROLE();
      expect(await creditOracle.hasRole(adminRole, admin.address)).to.be.true;
    });

    it("Should set the correct emergency role", async function () {
      const emergencyRole = await creditOracle.EMERGENCY_ROLE();
      expect(await creditOracle.hasRole(emergencyRole, emergency.address)).to.be.true;
    });

    it("Should set the correct security role", async function () {
      const securityRole = await creditOracle.SECURITY_ROLE();
      expect(await creditOracle.hasRole(securityRole, security.address)).to.be.true;
    });

    it("Should set the correct max daily volume", async function () {
      expect(await creditOracle.maxDailyVolume()).to.equal(MAX_DAILY_VOLUME);
    });
  });

  describe("Credit Score Management", function () {
    it("Should return initial credit score for new users", async function () {
      expect(await creditOracle.getCreditScore(user1.address)).to.equal(INITIAL_CREDIT_SCORE);
    });

    it("Should initialize credit profile on first activity", async function () {
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      
      const profile = await creditOracle.getCreditProfile(user1.address);
      expect(profile.isInitialized).to.be.true;
      expect(profile.creditScore).to.equal(INITIAL_CREDIT_SCORE);
      expect(profile.onTimeRepayments).to.equal(1);
    });

    it("Should update credit score after repayment", async function () {
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      
      // Advance time past cooldown
      await time.increase(3601); // 1 hour + 1 second
      
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      
      const profile = await creditOracle.getCreditProfile(user1.address);
      expect(profile.onTimeRepayments).to.equal(2);
      expect(profile.repaymentStreak).to.equal(2);
    });

    it("Should reset streak on late payment", async function () {
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, false);
      
      const profile = await creditOracle.getCreditProfile(user1.address);
      expect(profile.lateRepayments).to.equal(1);
      expect(profile.repaymentStreak).to.equal(0);
    });

    it("Should record savings activity", async function () {
      await creditOracle.connect(authorizedContract).recordSavingsActivity(user1.address, 5000, true);
      
      const profile = await creditOracle.getCreditProfile(user1.address);
      expect(profile.totalSavings).to.equal(5000);
    });

    it("Should record staking activity with duration weighting", async function () {
      const amount = 1000;
      const duration = 365 * 24 * 60 * 60; // 1 year in seconds
      
      await creditOracle.connect(authorizedContract).recordStakingActivity(user1.address, amount, duration);
      
      const profile = await creditOracle.getCreditProfile(user1.address);
      expect(profile.totalStaked).to.equal(amount); // 1000 * 365 days / 365 days = 1000
    });
  });

  describe("Collateral Calculations", function () {
    it("Should calculate higher collateral for lower credit scores", async function () {
      const loanAmount = ethers.parseEther("1000");
      
      // User with low credit score (default 600)
      const collateralLow = await creditOracle.calculateCollateralRequirement(user1.address, loanAmount);
      
      // Improve user2's credit score through activity
      await creditOracle.connect(authorizedContract).recordRepayment(user2.address, 10000, true);
      await creditOracle.connect(authorizedContract).recordSavingsActivity(user2.address, 50000, true);
      
      // Wait for cooldown and trigger another update
      await time.increase(3601);
      await creditOracle.connect(authorizedContract).recordRepayment(user2.address, 10000, true);
      
      const collateralHigh = await creditOracle.calculateCollateralRequirement(user2.address, loanAmount);
      
      expect(collateralLow).to.be.gt(collateralHigh);
    });

    it("Should enforce minimum and maximum collateral ratios", async function () {
      const loanAmount = ethers.parseEther("1000");
      const collateral = await creditOracle.calculateCollateralRequirement(user1.address, loanAmount);
      
      const minCollateralRatio = await creditOracle.minCollateralRatio();
      const maxCollateralRatio = await creditOracle.maxCollateralRatio();
      
      const minExpected = loanAmount * minCollateralRatio / 10000n;
      const maxExpected = loanAmount * maxCollateralRatio / 10000n;
      
      expect(collateral).to.be.gte(minExpected);
      expect(collateral).to.be.lte(maxExpected);
    });
  });

  describe("Loan Eligibility", function () {
    it("Should approve eligible users", async function () {
      const [eligible, reason] = await creditOracle.checkLoanEligibility(user1.address, 1000);
      expect(eligible).to.be.true;
      expect(reason).to.equal("Eligible for loan");
    });

    it("Should reject users with very low credit scores", async function () {
      // Create a user with very low credit score by recording late payments
      for (let i = 0; i < 10; i++) {
        await creditOracle.connect(authorizedContract).recordRepayment(user2.address, 100, false);
        await time.increase(3601);
      }
      
      const [eligible, reason] = await creditOracle.checkLoanEligibility(user2.address, 1000);
      // This test may need adjustment based on actual scoring algorithm
      expect(reason).to.not.equal("Eligible for loan");
    });

    it("Should reject zero loan amounts", async function () {
      const [eligible, reason] = await creditOracle.checkLoanEligibility(user1.address, 0);
      expect(eligible).to.be.false;
      expect(reason).to.equal("Loan amount must be positive");
    });

    it("Should reject invalid addresses", async function () {
      const [eligible, reason] = await creditOracle.checkLoanEligibility(ethers.ZeroAddress, 1000);
      expect(eligible).to.be.false;
      expect(reason).to.equal("Invalid user address");
    });
  });

  describe("Authorization", function () {
    it("Should only allow authorized contracts to record activity", async function () {
      await expect(
        creditOracle.connect(user1).recordRepayment(user1.address, 1000, true)
      ).to.be.revertedWith("CreditOracle: Caller not authorized");
    });

    it("Should allow admin to set authorized contracts", async function () {
      await creditOracle.connect(admin).setAuthorizedContract(user1.address, true);
      expect(await creditOracle.authorizedContracts(user1.address)).to.be.true;
      
      await creditOracle.connect(admin).setAuthorizedContract(user1.address, false);
      expect(await creditOracle.authorizedContracts(user1.address)).to.be.false;
    });

    it("Should prevent non-admin from setting authorized contracts", async function () {
      await expect(
        creditOracle.connect(user1).setAuthorizedContract(user2.address, true)
      ).to.be.reverted;
    });
  });

  describe("Security Features", function () {
    it("Should enforce daily volume limits", async function () {
      const largeAmount = MAX_DAILY_VOLUME + 1n;
      
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, largeAmount, true)
      ).to.be.revertedWith("CredisomniaSecurity: Daily volume limit exceeded");
    });

    it("Should allow circuit breaker activation", async function () {
      await creditOracle.connect(emergency).activateCircuitBreaker("Test emergency");
      
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true)
      ).to.be.revertedWith("CredisomniaSecurity: Operations halted");
    });

    it("Should allow circuit breaker deactivation", async function () {
      await creditOracle.connect(emergency).activateCircuitBreaker("Test emergency");
      await creditOracle.connect(emergency).deactivateCircuitBreaker();
      
      // Should work normally after deactivation
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true)
      ).to.not.be.reverted;
    });
  });

  describe("Parameter Updates", function () {
    it("Should allow admin to update scoring weights", async function () {
      await creditOracle.connect(admin).updateScoringWeights(
        5000, // repayment: 50%
        2000, // savings: 20%
        1000, // staking: 10%
        1000, // streak: 10%
        1000  // consistency: 10%
      );
      
      expect(await creditOracle.repaymentWeight()).to.equal(5000);
      expect(await creditOracle.savingsWeight()).to.equal(2000);
    });

    it("Should reject scoring weights that don't sum to 100%", async function () {
      await expect(
        creditOracle.connect(admin).updateScoringWeights(5000, 2000, 1000, 1000, 2000)
      ).to.be.revertedWith("CreditOracle: Weights must sum to 100%");
    });

    it("Should prevent non-admin from updating parameters", async function () {
      await expect(
        creditOracle.connect(user1).updateScoringWeights(5000, 2000, 1000, 1000, 1000)
      ).to.be.reverted;
    });
  });

  describe("Events", function () {
    it("Should emit CreditScoreUpdated events", async function () {
      // First call initializes the profile
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      
      // Wait for cooldown to pass
      await time.increase(3601); // 1 hour + 1 second
      
      // Second call should emit the event
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true)
      ).to.emit(creditOracle, "CreditScoreUpdated");
    });

    it("Should emit RepaymentRecorded events", async function () {
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true)
      ).to.emit(creditOracle, "RepaymentRecorded")
       .withArgs(user1.address, 1000, true);
    });

    it("Should emit SavingsActivityRecorded events", async function () {
      await expect(
        creditOracle.connect(authorizedContract).recordSavingsActivity(user1.address, 5000, true)
      ).to.emit(creditOracle, "SavingsActivityRecorded")
       .withArgs(user1.address, 5000, true);
    });

    it("Should emit StakingActivityRecorded events", async function () {
      await expect(
        creditOracle.connect(authorizedContract).recordStakingActivity(user1.address, 1000, 365 * 24 * 60 * 60)
      ).to.emit(creditOracle, "StakingActivityRecorded")
       .withArgs(user1.address, 1000, 365 * 24 * 60 * 60);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero address validation", async function () {
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(ethers.ZeroAddress, 1000, true)
      ).to.be.revertedWith("CreditOracle: Invalid user address");
    });

    it("Should handle zero amount validation", async function () {
      await expect(
        creditOracle.connect(authorizedContract).recordRepayment(user1.address, 0, true)
      ).to.be.revertedWith("CreditOracle: Amount must be positive");
    });

    it("Should handle score update cooldown", async function () {
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      const profile1 = await creditOracle.getCreditProfile(user1.address);
      
      // Immediate second update should not change score due to cooldown
      await creditOracle.connect(authorizedContract).recordRepayment(user1.address, 1000, true);
      const profile2 = await creditOracle.getCreditProfile(user1.address);
      
      expect(profile1.lastScoreUpdate).to.equal(profile2.lastScoreUpdate);
    });

    it("Should handle savings withdrawal without underflow", async function () {
      await creditOracle.connect(authorizedContract).recordSavingsActivity(user1.address, 1000, true);
      
      // Withdraw less than deposited should work normally  
      await creditOracle.connect(authorizedContract).recordSavingsActivity(user1.address, 500, false);
      
      const profile1 = await creditOracle.getCreditProfile(user1.address);
      expect(profile1.totalSavings).to.equal(500); // 1000 - 500 = 500
      
      // Withdraw more than remaining should not underflow - should remain unchanged
      await creditOracle.connect(authorizedContract).recordSavingsActivity(user1.address, 2000, false);
      
      const profile2 = await creditOracle.getCreditProfile(user1.address);
      expect(profile2.totalSavings).to.equal(500); // Should not underflow, stays at 500
    });
  });
});

// Mock ERC20 contract for testing
// This should be in a separate file in production
const MockERC20 = {
  contractName: "MockERC20",
  abi: [
    "constructor(string memory name, string memory symbol, uint256 totalSupply)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function totalSupply() external view returns (uint256)"
  ],
  bytecode: "0x608060405234801561001057600080fd5b506040516106a83803806106a8833981016040819052610033916100fd565b8251610046906000906020860190610081565b50815161005a906001906020850190610081565b50806002819055503360009081526003602052604090205580516100609082610125565b50505050610174565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b03808211156100ac576100ac61006b565b604051601f8301601f19908116603f011681019082821181831017156100d4576100d461006b565b816040528381526020925086838588010111156100f057600080fd5b600091505b83821015610112578582018301518183018401529082019061009557565b83821115610123576000838501525b505b9392505050565b6000821982111561014d57634e487b7160e01b600052601160045260246000fd5b500190565b80516001600160a01b038116811461016957600080fd5b919050565b61052580610183600039f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c578063095ea7b31461007a57806318160ddd1461009d57806323b872dd146100af578063313ce567146100c257600080fd5b600080fd5b6100646100ea565b60405161007191906103b8565b60405180910390f35b61008d610088366004610429565b610178565b6040519015158152602001610071565b6002545b604051908152602001610071565b61008d6100bd366004610453565b61018f565b6100c96101fb565b60405160ff9091168152602001610071565b6060600080546100f99061048f565b80601f01602080910402602001604051908101604052809291908181526020018280546101259061048f565b80156101725780601f1061014757610100808354040283529160200191610172565b820191906000526020600020905b81548152906001019060200180831161015557829003601f168201915b50505050509050919050565b600033610186818585610203565b60019150505b92915050565b60003361019d8582856102b5565b6101a885858561032f565b506001949350505050565b606060018054610149906104ca565b3360008181526004602090815260408083206001600160a01b0387168452909152812054909133916101f691859061023091869061050515b50505050565b600060006101b8565b505050565b6001600160a01b0383166102675760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084015b60405180910390fd5b6001600160a01b0382166102c85760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b606482015260840161025e565b6001600160a01b0383811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b038381166000908152600460209081526040808320938616835292905220546000198114610225578181101561037d5760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000604482015260640161025e565b6102258484848403610203565b6001600160a01b0383166103f35760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b606482015260840161025e565b6001600160a01b0382166104555760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b606482015260840161025e565b6001600160a01b038316600090815260036020526040902054818110156104cd5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b606482015260840161025e565b6001600160a01b03848116600081815260036020908152604080832087870390559387168083529184902080548701905592518581529092917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a350505050565b600060208083528351808285015260005b8181101561054957858101830151858201604001528201610530565b8181111561055b576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b038116811461058857600080fd5b919050565b600080604083850312156105a057600080fd5b6105a983610571565b946020939093013593505050565b6000806000606084860312156105cc57600080fd5b6105d584610571565b92506105e360208501610571565b9150604084013590509250925092565b600181811c9082168061060757607f821691505b6020821081141561062857634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b6000821982111561065757610657610625565b50019056fea2646970667358221220a9a8e6ef97c0d6e7b6e2e6d3b9a8e6ef97c0d6e7b6e2e6d3b9a8e6ef97c0d6e764736f6c634300080c0033"
};
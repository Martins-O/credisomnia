// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ICreditNFT
 * @dev Interface for soulbound Credit NFT contract
 * @author Credisomnia Team
 */
interface ICreditNFT is IERC721 {
    /// @dev Emitted when a Credit NFT is minted
    event CreditNFTMinted(address indexed to, uint256 indexed tokenId, uint256 creditScore);
    
    /// @dev Emitted when a Credit NFT's metadata is updated
    event CreditNFTUpdated(uint256 indexed tokenId, uint256 oldScore, uint256 newScore);
    
    /// @dev Emitted when transfer is attempted (should fail for soulbound)
    event TransferAttempted(address indexed from, address indexed to, uint256 indexed tokenId);

    struct CreditMetadata {
        uint256 creditScore;        // Current credit score
        uint256 mintTimestamp;      // When NFT was minted
        uint256 lastUpdate;         // Last score update timestamp
        string tier;                // Credit tier (e.g., "Excellent", "Good")
        uint256 totalRepayments;    // Total successful repayments
        uint256 repaymentStreak;    // Current on-time repayment streak
    }

    /**
     * @dev Mints a new Credit NFT to a user
     * @param to Address to mint the NFT to
     * @param creditScore Initial credit score
     * @return tokenId The minted token ID
     */
    function mintCreditNFT(address to, uint256 creditScore) external returns (uint256 tokenId);

    /**
     * @dev Updates the credit score and metadata for a token
     * @param tokenId Token ID to update
     * @param newCreditScore New credit score
     * @param totalRepayments Updated total repayments
     * @param repaymentStreak Updated repayment streak
     */
    function updateCreditScore(
        uint256 tokenId,
        uint256 newCreditScore,
        uint256 totalRepayments,
        uint256 repaymentStreak
    ) external;

    /**
     * @dev Gets the credit metadata for a token
     * @param tokenId Token ID to query
     * @return Credit metadata struct
     */
    function getCreditMetadata(uint256 tokenId) external view returns (CreditMetadata memory);

    /**
     * @dev Gets the token ID owned by a user
     * @param user Address of the user
     * @return tokenId Token ID owned by the user (0 if none)
     */
    function getTokenIdByUser(address user) external view returns (uint256 tokenId);

    /**
     * @dev Checks if an address owns a Credit NFT
     * @param user Address to check
     * @return True if the user owns a Credit NFT
     */
    function hasCreditNFT(address user) external view returns (bool);

    /**
     * @dev Gets the credit tier string based on score
     * @param creditScore Credit score to evaluate
     * @return Credit tier string
     */
    function getCreditTier(uint256 creditScore) external pure returns (string memory);

    /**
     * @dev Burns a Credit NFT (admin only, for emergencies)
     * @param tokenId Token ID to burn
     */
    function burnCreditNFT(uint256 tokenId) external;

    /**
     * @dev Generates the token URI with dynamic metadata
     * @param tokenId Token ID to generate URI for
     * @return Token URI with base64 encoded JSON metadata
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);

    /**
     * @dev Checks if transfers are permanently disabled (soulbound)
     * @return True if soulbound (transfers disabled)
     */
    function isSoulbound() external pure returns (bool);
}
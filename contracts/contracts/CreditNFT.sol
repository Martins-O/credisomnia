// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./interfaces/ICreditNFT.sol";
import "./interfaces/ICreditOracle.sol";
import "./security/CredisomniaSecurity.sol";

/**
 * @title CreditNFT
 * @dev Soulbound NFT representing user credit scores with dynamic metadata
 * @author Credisomnia Team
 * @custom:security-contact security@credisomnia.com
 */
contract CreditNFT is ERC721, ICreditNFT, CredisomniaSecurity {
    using Strings for uint256;

    /// @dev Token ID counter
    uint256 private _tokenIdCounter;

    /// @dev Credit Oracle contract
    ICreditOracle public immutable creditOracle;

    /// @dev Mapping from user address to token ID
    mapping(address => uint256) public userToTokenId;

    /// @dev Mapping from token ID to credit metadata
    mapping(uint256 => CreditMetadata) public tokenMetadata;

    /// @dev Role for minting operations
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev Role for updating credit scores
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    /// @dev SVG template for dynamic NFT image generation
    string private constant SVG_TEMPLATE =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:{bgColor1}"/><stop offset="100%" style="stop-color:{bgColor2}"/></linearGradient></defs><rect width="350" height="500" fill="url(#bg)"/><rect x="20" y="20" width="310" height="460" rx="15" fill="rgba(255,255,255,0.1)"/><text x="175" y="60" font-family="Arial,sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">CREDISOMNIA</text><text x="175" y="85" font-family="Arial,sans-serif" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.7)">Credit Score NFT</text><rect x="40" y="120" width="270" height="280" rx="10" fill="rgba(255,255,255,0.2)"/><text x="175" y="160" font-family="Arial,sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">{creditScore}</text><text x="175" y="185" font-family="Arial,sans-serif" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.9)">{tier}</text><text x="60" y="230" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Repayments: {totalRepayments}</text><text x="60" y="255" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Streak: {repaymentStreak}</text><text x="60" y="280" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.8)">Member Since: {memberSince}</text><text x="175" y="450" font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="rgba(255,255,255,0.6)">Soulbound - Non-Transferable</text></svg>';

    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, msg.sender),
            "CreditNFT: Caller is not minter"
        );
        _;
    }

    modifier onlyUpdater() {
        require(
            hasRole(UPDATER_ROLE, msg.sender),
            "CreditNFT: Caller is not updater"
        );
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "CreditNFT: Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "CreditNFT: Not token owner");
        _;
    }

    /**
     * @dev Constructor initializes the soulbound NFT with security parameters
     * @param admin Address to receive admin role
     * @param emergencyAddress Address for emergency operations
     * @param securityAddress Address for security operations
     * @param maxDailyVolume Maximum daily volume for security
     * @param _creditOracle Address of the Credit Oracle contract
     */
    constructor(
        address admin,
        address emergencyAddress,
        address securityAddress,
        uint256 maxDailyVolume,
        address _creditOracle
    )
        ERC721("Credisomnia Credit NFT", "CRED")
        CredisomniaSecurity(
            admin,
            emergencyAddress,
            securityAddress,
            maxDailyVolume
        )
    {
        require(
            _creditOracle != address(0),
            "CreditNFT: Invalid oracle address"
        );
        creditOracle = ICreditOracle(_creditOracle);

        // Grant minter and updater roles to admin initially
        _grantRole(MINTER_ROLE, admin);
        _grantRole(UPDATER_ROLE, admin);

        // Start token IDs from 1
        _tokenIdCounter = 1;
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function mintCreditNFT(
        address to,
        uint256 creditScore
    ) external override onlyMinter onlyWhenNotPaused returns (uint256 tokenId) {
        require(to != address(0), "CreditNFT: Cannot mint to zero address");
        require(userToTokenId[to] == 0, "CreditNFT: User already has Credit NFT");
        require(
            creditScore >= 300 && creditScore <= 850,
            "CreditNFT: Invalid credit score"
        );

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Initialize metadata
        tokenMetadata[tokenId] = CreditMetadata({
            creditScore: creditScore,
            mintTimestamp: block.timestamp,
            lastUpdate: block.timestamp,
            tier: getCreditTier(creditScore),
            totalRepayments: 0,
            repaymentStreak: 0
        });

        // Map user to token ID
        userToTokenId[to] = tokenId;

        // Mint the token
        _safeMint(to, tokenId);

        emit CreditNFTMinted(to, tokenId, creditScore);
        return tokenId;
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function updateCreditScore(
        uint256 tokenId,
        uint256 newCreditScore,
        uint256 totalRepayments,
        uint256 repaymentStreak
    ) external override onlyUpdater onlyWhenNotPaused {
        require(_ownerOf(tokenId) != address(0), "CreditNFT: Token does not exist");
        require(
            newCreditScore >= 300 && newCreditScore <= 850,
            "CreditNFT: Invalid credit score"
        );

        CreditMetadata storage metadata = tokenMetadata[tokenId];
        uint256 oldScore = metadata.creditScore;

        // Update metadata
        metadata.creditScore = newCreditScore;
        metadata.lastUpdate = block.timestamp;
        metadata.tier = getCreditTier(newCreditScore);
        metadata.totalRepayments = totalRepayments;
        metadata.repaymentStreak = repaymentStreak;

        emit CreditNFTUpdated(tokenId, oldScore, newCreditScore);
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function getCreditMetadata(
        uint256 tokenId
    ) external view override returns (CreditMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "CreditNFT: Token does not exist");
        return tokenMetadata[tokenId];
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function getTokenIdByUser(
        address user
    ) external view override returns (uint256 tokenId) {
        return userToTokenId[user];
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function hasCreditNFT(address user) external view override returns (bool) {
        uint256 tokenId = userToTokenId[user];
        return tokenId != 0 && _ownerOf(tokenId) != address(0);
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function getCreditTier(
        uint256 creditScore
    ) public pure override returns (string memory) {
        if (creditScore >= 800) return "Excellent";
        if (creditScore >= 740) return "Very Good";
        if (creditScore >= 670) return "Good";
        if (creditScore >= 580) return "Fair";
        return "Poor";
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function burnCreditNFT(
        uint256 tokenId
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "CreditNFT: Token does not exist");

        address owner = ownerOf(tokenId);

        // Clear user mapping
        userToTokenId[owner] = 0;

        // Clear metadata
        delete tokenMetadata[tokenId];

        // Burn the token
        _burn(tokenId);
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ICreditNFT) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "CreditNFT: Token does not exist");

        CreditMetadata memory metadata = tokenMetadata[tokenId];

        // Generate dynamic SVG
        string memory svg = _generateSVG(metadata);

        // Create JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Credisomnia Credit Score #',
                        tokenId.toString(),
                        '", "description": "Soulbound NFT representing credit score on Credisomnia platform", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [',
                        '{"trait_type": "Credit Score", "value": ',
                        metadata.creditScore.toString(),
                        '}, {"trait_type": "Credit Tier", "value": "',
                        metadata.tier,
                        '"}, {"trait_type": "Total Repayments", "value": ',
                        metadata.totalRepayments.toString(),
                        '}, {"trait_type": "Repayment Streak", "value": ',
                        metadata.repaymentStreak.toString(),
                        '}, {"trait_type": "Soulbound", "value": "true"}',
                        "]}"
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @inheritdoc ICreditNFT
     */
    function isSoulbound() external pure override returns (bool) {
        return true;
    }

    /**
     * @dev Generates SVG image for the NFT based on credit metadata
     * @param metadata Credit metadata for the token
     * @return Generated SVG string
     */
    function _generateSVG(
        CreditMetadata memory metadata
    ) internal pure returns (string memory) {
        // Determine colors based on credit score
        (string memory bgColor1, string memory bgColor2) = _getColorsForScore(
            metadata.creditScore
        );

        // Format member since date
        string memory memberSince = _formatTimestamp(metadata.mintTimestamp);

        // Replace template variables
        string memory svg = SVG_TEMPLATE;
        svg = _replace(svg, "{bgColor1}", bgColor1);
        svg = _replace(svg, "{bgColor2}", bgColor2);
        svg = _replace(svg, "{creditScore}", metadata.creditScore.toString());
        svg = _replace(svg, "{tier}", metadata.tier);
        svg = _replace(
            svg,
            "{totalRepayments}",
            metadata.totalRepayments.toString()
        );
        svg = _replace(
            svg,
            "{repaymentStreak}",
            metadata.repaymentStreak.toString()
        );
        svg = _replace(svg, "{memberSince}", memberSince);

        return svg;
    }

    /**
     * @dev Gets gradient colors based on credit score
     * @param creditScore Credit score to evaluate
     * @return bgColor1 First gradient color
     * @return bgColor2 Second gradient color
     */
    function _getColorsForScore(
        uint256 creditScore
    ) internal pure returns (string memory bgColor1, string memory bgColor2) {
        if (creditScore >= 800) {
            return ("#1a5f3f", "#2d8f6f"); // Excellent - Green
        } else if (creditScore >= 740) {
            return ("#1a4f5f", "#2d7f8f"); // Very Good - Teal
        } else if (creditScore >= 670) {
            return ("#1a3f5f", "#2d5f8f"); // Good - Blue
        } else if (creditScore >= 580) {
            return ("#5f4f1a", "#8f7f2d"); // Fair - Orange
        } else {
            return ("#5f1a1a", "#8f2d2d"); // Poor - Red
        }
    }

    /**
     * @dev Simple string replacement function
     * @param source Source string
     * @return Result with replacements made (placeholder implementation)
     */
    function _replace(
        string memory source,
        string memory search,
        string memory replacement
    ) internal pure returns (string memory) {
        bytes memory sourceBytes = bytes(source);
        bytes memory searchBytes = bytes(search);
        bytes memory replacementBytes = bytes(replacement);
        
        if (searchBytes.length == 0 || sourceBytes.length < searchBytes.length) {
            return source;
        }
        
        // Find the first occurrence of search string
        uint256 matchIndex = type(uint256).max;
        for (uint256 i = 0; i <= sourceBytes.length - searchBytes.length; i++) {
            bool matches = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
                if (sourceBytes[i + j] != searchBytes[j]) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                matchIndex = i;
                break;
            }
        }
        
        if (matchIndex == type(uint256).max) {
            return source; // No match found
        }
        
        // Build result with replacement
        bytes memory result = new bytes(
            sourceBytes.length - searchBytes.length + replacementBytes.length
        );
        
        // Copy before match
        for (uint256 i = 0; i < matchIndex; i++) {
            result[i] = sourceBytes[i];
        }
        
        // Copy replacement
        for (uint256 i = 0; i < replacementBytes.length; i++) {
            result[matchIndex + i] = replacementBytes[i];
        }
        
        // Copy after match
        for (uint256 i = matchIndex + searchBytes.length; i < sourceBytes.length; i++) {
            result[matchIndex + replacementBytes.length + i - matchIndex - searchBytes.length] = sourceBytes[i];
        }
        
        return string(result);
    }

    /**
     * @dev Formats timestamp to readable date
     * @param timestamp Timestamp to format
     * @return Formatted date string
     */
    function _formatTimestamp(
        uint256 timestamp
    ) internal pure returns (string memory) {
        // Simple year extraction - in production, use a date library
        uint256 year = 1970 + (timestamp / 365 days);
        return year.toString();
    }

    /**
     * @dev Override transfer functions to make tokens soulbound
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            emit TransferAttempted(from, to, tokenId);
            revert("CreditNFT: Soulbound tokens cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Disable approve function for soulbound tokens
     */
    function approve(
        address, // to - unused in soulbound implementation
        uint256  // tokenId - unused in soulbound implementation
    ) public virtual override(ERC721, IERC721) {
        revert("CreditNFT: Soulbound tokens cannot be approved");
    }

    /**
     * @dev Disable setApprovalForAll for soulbound tokens
     */
    function setApprovalForAll(
        address, // operator - unused in soulbound implementation
        bool     // approved - unused in soulbound implementation
    ) public virtual override(ERC721, IERC721) {
        revert("CreditNFT: Soulbound tokens cannot be approved");
    }

    /**
     * @dev Grant minter role to address
     * @param minter Address to grant minter role
     */
    function grantMinterRole(
        address minter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Grant updater role to address
     * @param updater Address to grant updater role
     */
    function grantUpdaterRole(
        address updater
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(UPDATER_ROLE, updater);
    }

    /**
     * @dev Check if contract supports interface
     * @param interfaceId Interface ID to check
     * @return True if interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

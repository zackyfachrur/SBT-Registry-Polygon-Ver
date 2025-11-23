// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * CredentialRegistry
 * - HANYA untuk anchoring fingerprint credential.
 * - Menyimpan issuerID, metaHash, expiry per tokenId.
 * - Tidak ada status VALID/REVOKED di sini.
 * - Tidak ada fungsi update / revoke.
 */
contract CredentialRegistry is Ownable {
    struct RegistryEntry {
        string issuerID;
        bytes32 metaHash;
        uint256 expiry;
    }

    event CredentialRegistered(
        uint256 indexed tokenId,
        string issuerID,
        bytes32 metaHash,
        uint256 expiry
    );

    event ValidatorUpdated(address indexed oldValidator, address indexed newValidator);

    mapping(uint256 => RegistryEntry) private registry;
    uint256 private _nextTokenId;

    address public validator;

    modifier onlyValidator() {
        require(msg.sender == validator, "Not validator");
        _;
    }

    constructor(address initialValidator) {
        require(initialValidator != address(0), "Zero validator");
        validator = initialValidator;
    }

    function setValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Zero validator");
        address old = validator;
        validator = newValidator;
        emit ValidatorUpdated(old, newValidator);
    }

    function currentTokenCounter() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * attest()
     * - Anchoring immutable fingerprint.
     * - Input: issuerID, subjectID, credType, issueDate, expiry
     * - Output: tokenId baru
     */
    function attest(
        string calldata issuerID,
        string calldata subjectID,
        string calldata credType,
        uint256 issueDate,
        uint256 expiry
    ) external onlyValidator returns (uint256 tokenId) {
        bool missingStrings =
            bytes(issuerID).length == 0 ||
            bytes(subjectID).length == 0 ||
            bytes(credType).length == 0;

        bool missingIssueDate = issueDate == 0;
        // expiry = 0 artinya "tidak pernah expired"
        bool invalidExpiry = expiry > 0 && expiry <= block.timestamp;

        require(
            !missingStrings && !missingIssueDate && !invalidExpiry,
            "Invalid metadata"
        );

        tokenId = ++_nextTokenId;

        bytes32 metaHash = keccak256(
            abi.encodePacked(issuerID, subjectID, credType, issueDate)
        );

        registry[tokenId] = RegistryEntry({
            issuerID: issuerID,
            metaHash: metaHash,
            expiry: expiry
        });

        emit CredentialRegistered(tokenId, issuerID, metaHash, expiry);
    }

    /**
     * getCredentialInfo()
     * - View-only, untuk dibaca Minting/SBT contract dan verifier.
     * - TIDAK melakukan interpretasi status (valid/revoked/expired).
     */
    function getCredentialInfo(uint256 tokenId)
        external
        view
        returns (
            bool found,
            string memory issuerID,
            bytes32 metaHash,
            uint256 expiry
        )
    {
        RegistryEntry memory entry = registry[tokenId];
        if (entry.metaHash == bytes32(0)) {
            return (false, "", bytes32(0), 0);
        }
        return (true, entry.issuerID, entry.metaHash, entry.expiry);
    }
}
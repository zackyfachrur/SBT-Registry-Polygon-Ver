// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * CredentialRegistry
 * - Menyimpan fingerprint (metaHash) + expiry per tokenId.
 * - tokenId di-generate OTOMATIS oleh kontrak via _nextToken().
 * - Hanya validator yang boleh memanggil attest().
 */
contract CredentialRegistry is Ownable {
    enum Status {
        NONE,
        VALID,
        REVOKED
    }

    struct Credential {
        string issuerID;
        bytes32 metaHash;
        uint256 expiry;
        Status status;
    }

    /// @notice event untuk pencatatan immutable di log EVM
    event CredentialRegistered(
        uint256 indexed tokenId,
        string issuerID,
        bytes32 metaHash,
        uint256 expiry
    );

    event ValidatorUpdated(address indexed oldValidator, address indexed newValidator);

    // tokenId -> Credential
    mapping(uint256 => Credential) private registry;

    // internal counter untuk nextToken()
    uint256 private _nextTokenId;

    /// @notice wallet yang berperan sebagai Validator (onlyValidator)
    address public validator;

    modifier onlyValidator() {
        require(msg.sender == validator, "Not validator");
        _;
    }

    constructor(address initialValidator) {
        require(initialValidator != address(0), "Zero validator");
        validator = initialValidator;
    }

    /// @notice optional: ganti validator oleh owner
    function setValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Zero validator");
        address old = validator;
        validator = newValidator;
        emit ValidatorUpdated(old, newValidator);
    }

    /// @notice internal nextToken() seperti di pseudocode
    function _nextToken() internal returns (uint256) {
        _nextTokenId += 1;
        return _nextTokenId;
    }

    /// @notice helper view kalau mau cek nilai counter dari luar (opsional)
    function currentTokenCounter() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * attest()
     *
     * Input: issuerID, subjectID, credType, issueDate, expiry
     * - Hanya validator
     * - Validasi metadata (string kosong, issueDate, expiry)
     * - Generate tokenId via _nextToken() (otomatis, tidak bisa dipilih caller)
     * - Hitung metaHash = keccak256(issuerID ∥ subjectID ∥ credType ∥ issueDate)
     * - Simpan ke registry[tokenId] dengan status VALID
     * - Emit CredentialRegistered(tokenId, issuerID, metaHash, expiry)
     */
    function attest(
        string calldata issuerID,
        string calldata subjectID,
        string calldata credType,
        uint256 issueDate,
        uint256 expiry
    ) external onlyValidator returns (uint256 tokenId) {
        _validateMetadata(issuerID, subjectID, credType, issueDate, expiry);

        tokenId = _nextToken(); // <--- ini yang sesuai "tokenId <- nextToken()"

        bytes32 metaHash = keccak256(
            abi.encodePacked(issuerID, subjectID, credType, issueDate)
        );

        registry[tokenId] = Credential({
            issuerID: issuerID,
            metaHash: metaHash,
            expiry: expiry,
            status: Status.VALID
        });

        emit CredentialRegistered(tokenId, issuerID, metaHash, expiry);
    }

    function _validateMetadata(
        string calldata issuerID,
        string calldata subjectID,
        string calldata credType,
        uint256 issueDate,
        uint256 expiry
    ) internal view {
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
    }

    /**
     * getCredentialInfo()
     * Read-only (view), dipakai oleh Verifier/issuer untuk cek fingerprint & expiry.
     */
    function getCredentialInfo(uint256 tokenId)
        external
        view
        returns (
            string memory issuerID,
            bytes32 metaHash,
            uint256 expiry,
            Status status
        )
    {
        Credential storage cred = registry[tokenId];
        require(cred.status != Status.NONE, "not found");
        return (cred.issuerID, cred.metaHash, cred.expiry, cred.status);
    }
}

// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

contract IdentityRegistry is ERC721URIStorage, ReentrancyGuard, IIdentityRegistry {
    uint256 private _nextAgentId = 1;

    mapping(uint256 => mapping(string => bytes)) private _metadata;
    mapping(uint256 => address) private _agentWallet;

    bytes32 private constant _TYPE_HASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant _SET_AGENT_WALLET_TYPEHASH =
        keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)");
    bytes32 private immutable _DOMAIN_SEPARATOR;

    constructor() ERC721("ERC-8004 Trustless Agent", "AGENT") {
        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                _TYPE_HASH,
                keccak256(bytes("ERC-8004 IdentityRegistry")),
                keccak256(bytes("1.1")),
                block.chainid,
                address(this)
            )
        );
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IIdentityRegistry).interfaceId || super.supportsInterface(interfaceId);
    }

    function register(string calldata agentURI, MetadataEntry[] calldata metadata)
        external
        nonReentrant
        returns (uint256 agentId)
    {
        agentId = _mintAgent(msg.sender, agentURI);
        if (metadata.length > 0) {
            _setMetadataBatch(agentId, metadata);
        }
    }

    function register(string calldata agentURI) external nonReentrant returns (uint256 agentId) {
        agentId = _mintAgent(msg.sender, agentURI);
        }

    function register() external nonReentrant returns (uint256 agentId) {
        agentId = _mintAgent(msg.sender, "");
    }

    function setMetadata(uint256 agentId, string calldata metadataKey, bytes calldata metadataValue)
        external
    {
        address owner = _ownerOf(agentId);
        require(owner != address(0), "Agent does not exist");
        require(_isAuthorized(owner, msg.sender, agentId), "Not authorized");
        _setMetadata(agentId, metadataKey, metadataValue);
    }

    function getMetadata(uint256 agentId, string calldata metadataKey)
        external
        view
        returns (bytes memory metadataValue)
    {
        _requireOwned(agentId);
        if (_isAgentWalletKey(metadataKey)) return abi.encode(_agentWallet[agentId]);
        return _metadata[agentId][metadataKey];
    }

    function setAgentURI(uint256 agentId, string calldata newURI) external {
        address owner = _ownerOf(agentId);
        require(owner != address(0), "Agent does not exist");
        require(_isAuthorized(owner, msg.sender, agentId), "Not authorized");
        require(bytes(newURI).length > 0, "Empty URI");
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external {
        address owner = _ownerOf(agentId);
        require(owner != address(0), "Agent does not exist");
        require(_isAuthorized(owner, msg.sender, agentId), "Not authorized");
        require(newWallet != address(0), "Invalid wallet address");
        require(block.timestamp <= deadline, "Signature expired");

        bytes32 structHash = _hashSetAgentWallet(agentId, newWallet, deadline);
        bytes32 digest = _hashTypedData(structHash);
        require(SignatureChecker.isValidSignatureNow(newWallet, digest, signature), "Invalid signature");

        _agentWallet[agentId] = newWallet;
        emit AgentWalletSet(agentId, newWallet, msg.sender);
        }

    function getAgentWallet(uint256 agentId) external view returns (address wallet) {
        _requireOwned(agentId);
        return _agentWallet[agentId];
        }

    function totalAgents() external view returns (uint256 count) {
        return _nextAgentId - 1;
    }

    function agentExists(uint256 agentId) external view returns (bool exists) {
        return _ownerOf(agentId) != address(0);
    }

    function _mintAgent(address to, string memory agentURI) internal returns (uint256 agentId) {
        require(to != address(0), "Invalid recipient");
        agentId = _nextAgentId;
        _nextAgentId += 1;
        _safeMint(to, agentId);
        if (bytes(agentURI).length > 0) {
            _setTokenURI(agentId, agentURI);
        }
        _agentWallet[agentId] = to;
        emit Registered(agentId, agentURI, to);
    }

    function _setMetadataBatch(uint256 agentId, MetadataEntry[] calldata metadata) internal {
        uint256 length = metadata.length;
        for (uint256 i = 0; i < length; i++) {
            _setMetadata(agentId, metadata[i].metadataKey, metadata[i].metadataValue);
        }
    }

    function _setMetadata(uint256 agentId, string memory metadataKey, bytes memory metadataValue)
        internal
    {
        require(bytes(metadataKey).length > 0, "Empty key");
        require(!_isAgentWalletKey(metadataKey), "Cannot set agentWallet via setMetadata");
        _metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    function _isAgentWalletKey(string memory metadataKey) internal pure returns (bool) {
        return keccak256(bytes(metadataKey)) == keccak256(bytes("agentWallet"));
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0) && from != to) {
            _agentWallet[tokenId] = address(0);
        }
        return from;
    }

    function _hashSetAgentWallet(uint256 agentId, address newWallet, uint256 deadline)
        internal
        pure
        returns (bytes32 result)
    {
        bytes32 typehash = _SET_AGENT_WALLET_TYPEHASH;
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, typehash)
            mstore(add(ptr, 0x20), agentId)
            mstore(add(ptr, 0x40), newWallet)
            mstore(add(ptr, 0x60), deadline)
            result := keccak256(ptr, 0x80)
        }
    }

    function _hashTypedData(bytes32 structHash) internal view returns (bytes32 result) {
        bytes32 domainSeparator = _DOMAIN_SEPARATOR;
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, 0x1901)
            mstore(add(ptr, 0x20), domainSeparator)
            mstore(add(ptr, 0x40), structHash)
            result := keccak256(add(ptr, 0x1e), 0x42)
    }
}
}
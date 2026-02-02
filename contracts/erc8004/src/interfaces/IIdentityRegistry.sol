// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

/// @title IIdentityRegistry
/// @notice ERC-8004 Identity Registry interface (Jan 2026 update)
interface IIdentityRegistry is IERC721, IERC721Metadata {
    /// @notice Metadata entry for batch updates
    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    /// @notice Emitted when a new agent is registered
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);

    /// @notice Emitted when metadata is set for an agent
    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey, 
        string metadataKey, 
        bytes metadataValue
    );

    /// @notice Emitted when agentURI is updated
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    /// @notice Emitted when agentWallet is set or updated
    event AgentWalletSet(uint256 indexed agentId, address indexed newWallet, address indexed setBy);

    /// @notice Register a new agent with agentURI and metadata
    function register(
        string calldata agentURI, 
        MetadataEntry[] calldata metadata
    ) external returns (uint256 agentId);

    /// @notice Register a new agent with agentURI only
    function register(string calldata agentURI) external returns (uint256 agentId);

    /// @notice Register a new agent without agentURI
    function register() external returns (uint256 agentId);

    /// @notice Set metadata for an agent (agentWallet is reserved)
    function setMetadata(
        uint256 agentId, 
        string calldata metadataKey, 
        bytes calldata metadataValue
    ) external;

    /// @notice Get metadata for an agent
    function getMetadata(
        uint256 agentId, 
        string calldata metadataKey
    ) external view returns (bytes memory metadataValue);

    /// @notice Update the agentURI for an agent
    function setAgentURI(uint256 agentId, string calldata newURI) external;

    /// @notice Set the agentWallet address with signature verification
    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Get the agentWallet address for an agent
    function getAgentWallet(uint256 agentId) external view returns (address wallet);

    /// @notice Get the total number of registered agents
    function totalAgents() external view returns (uint256 count);

    /// @notice Check if an agent exists
    function agentExists(uint256 agentId) external view returns (bool exists);
}
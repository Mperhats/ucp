// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

/// @title IReputationRegistry
/// @notice ERC-8004 Reputation Registry interface (Jan 2026 update)
interface IReputationRegistry {
    /// @notice Emitted when feedback is submitted
    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        uint8 score,
        string indexed tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    /// @notice Emitted when feedback is revoked
    event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex);

    /// @notice Emitted when a response is appended
    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI
    );

    /// @notice Thrown when the provided identity registry address is invalid
    error InvalidIdentityRegistryAddress();

    /// @notice Thrown when an agent with the specified ID is not found
    error AgentNotFound(uint256 agentId);

    /// @notice Thrown when a score is out of range
    error InvalidScore(uint8 score, uint8 min, uint8 max);

    /// @notice Thrown when a feedback index is invalid
    error InvalidFeedbackIndex(uint64 feedbackIndex);

    /// @notice Thrown when feedback is already revoked
    error AlreadyRevoked(uint256 agentId, address clientAddress, uint64 feedbackIndex);

    /// @notice Thrown when response URI is empty
    error EmptyResponseURI();

    /// @notice Give feedback for an agent
    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;

    /// @notice Revoke previously given feedback
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external;

    /// @notice Append a response to feedback
    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external;

    /// @notice Get aggregated summary for an agent
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, uint8 averageScore);

    /// @notice Read a specific feedback entry
    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (uint8 score, string memory tag1, string memory tag2, bool isRevoked);

    /// @notice Read all feedback for an agent
    function readAllFeedback(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2,
        bool includeRevoked
    )
        external
        view
        returns (
            address[] memory clientAddresses_,
            uint64[] memory feedbackIndexes,
            uint8[] memory scores,
            string[] memory tag1s,
            string[] memory tag2s,
            bool[] memory revokedStatuses
        );

    /// @notice Get response count for feedback entries
    function getResponseCount(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        address[] calldata responders
    ) external view returns (uint64 count);

    /// @notice Get all clients who gave feedback to an agent
    function getClients(uint256 agentId) external view returns (address[] memory clientList);

    /// @notice Get the last feedback index for a client-agent pair
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64 lastIndex);

    /// @notice Get the identity registry address
    function getIdentityRegistry() external view returns (address registry);
}

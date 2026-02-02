// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.30;

/// @title IValidationRegistry
/// @notice ERC-8004 Validation Registry interface (Jan 2026 update)
interface IValidationRegistry {
    /// @notice Emitted when a validation request is made
    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 indexed requestHash
    );

    /// @notice Emitted when a validation response is provided
    event ValidationResponse(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    /// @notice Thrown when the provided identity registry address is invalid
    error InvalidIdentityRegistryAddress();

    /// @notice Thrown when an agent with the specified ID is not found
    error AgentNotFound(uint256 agentId);

    /// @notice Thrown when the caller is not authorized to perform an action
    error Unauthorized(address caller, address expected);

    /// @notice Thrown when a validation request does not exist
    error RequestNotFound(bytes32 requestHash);

    /// @notice Thrown when a response is out of range
    error InvalidResponse(uint8 response, uint8 minResponse, uint8 maxResponse);

    /// @notice Request validation for an agent's work
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external;

    /// @notice Provide a validation response
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external;

    /// @notice Get validation status for a request
    function getValidationStatus(bytes32 requestHash)
        external
        view
        returns (
            address validatorAddress,
            uint256 agentId,
            uint8 response,
            string memory tag,
            uint256 lastUpdate
        );

    /// @notice Get aggregated validation summary for an agent
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse);

    /// @notice Get all validation request hashes for an agent
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory requestHashes);

    /// @notice Get all validation request hashes for a validator
    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory requestHashes);

    /// @notice Check if a validation request exists
    function requestExists(bytes32 requestHash) external view returns (bool exists);

    /// @notice Get validation request details
    function getRequest(bytes32 requestHash)
        external
        view
        returns (address validatorAddress, uint256 agentId, string memory requestURI, uint256 timestamp);

    /// @notice Get the identity registry address
    function getIdentityRegistry() external view returns (address registry);
}

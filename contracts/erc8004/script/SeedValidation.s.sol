// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {ValidationRegistry} from "../src/ValidationRegistry.sol";

contract SeedValidation is Script {
    function run(address identityRegistryAddress, address validationRegistryAddress) external {
        if (identityRegistryAddress == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }
        if (validationRegistryAddress == address(0)) {
            revert("VALIDATION_REGISTRY is required");
        }

        uint256 deployerKey = vm.envUint("ANVIL_DEPLOYER_KEY");
        uint256 agentKey = uint256(
            keccak256(abi.encodePacked(validationRegistryAddress, block.number, block.timestamp))
        );
        uint256 validatorKey = uint256(
            keccak256(abi.encodePacked(identityRegistryAddress, validationRegistryAddress, block.timestamp))
        );
        address agentAddress = vm.addr(agentKey);
        address validatorAddress = vm.addr(validatorKey);

        string memory agentUri =
            string.concat("https://example.com/agents/", vm.toString(agentAddress), ".json");

        vm.startBroadcast(deployerKey);
        (bool fundedAgent,) = agentAddress.call{value: 0.01 ether}("");
        require(fundedAgent, "Failed to fund agent address");
        (bool fundedValidator,) = validatorAddress.call{value: 0.01 ether}("");
        require(fundedValidator, "Failed to fund validator address");
        vm.stopBroadcast();

        vm.startBroadcast(agentKey);
        uint256 agentId = IdentityRegistry(identityRegistryAddress).register(agentUri);
        vm.stopBroadcast();

        bytes32 requestHash = keccak256(abi.encodePacked(agentId, validatorAddress, block.timestamp));

        vm.startBroadcast(agentKey);
        ValidationRegistry(validationRegistryAddress).validationRequest(
            validatorAddress,
            agentId,
            "ipfs://validation-request",
            requestHash
        );
        vm.stopBroadcast();

        vm.startBroadcast(validatorKey);
        ValidationRegistry(validationRegistryAddress).validationResponse(
            requestHash,
            95,
            "ipfs://validation-response",
            keccak256(bytes("sample-response")),
            "quality"
        );
        vm.stopBroadcast();
    }
}

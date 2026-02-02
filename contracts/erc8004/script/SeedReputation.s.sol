// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";

contract SeedReputation is Script {
    function run(address identityRegistryAddress, address reputationRegistryAddress) external {
        if (identityRegistryAddress == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }
        if (reputationRegistryAddress == address(0)) {
            revert("REPUTATION_REGISTRY is required");
        }

        uint256 deployerKey = vm.envUint("ANVIL_DEPLOYER_KEY");
        uint256 agentKey = uint256(
            keccak256(abi.encodePacked(reputationRegistryAddress, block.number, block.timestamp))
        );
        uint256 clientKey = uint256(
            keccak256(abi.encodePacked(identityRegistryAddress, reputationRegistryAddress, block.timestamp))
        );
        address agentAddress = vm.addr(agentKey);
        address clientAddress = vm.addr(clientKey);

        string memory agentUri =
            string.concat("https://example.com/agents/", vm.toString(agentAddress), ".json");

        vm.startBroadcast(deployerKey);
        (bool fundedAgent,) = agentAddress.call{value: 0.01 ether}("");
        require(fundedAgent, "Failed to fund agent address");
        (bool fundedClient,) = clientAddress.call{value: 0.01 ether}("");
        require(fundedClient, "Failed to fund client address");
        vm.stopBroadcast();

        vm.startBroadcast(agentKey);
        uint256 agentId = IdentityRegistry(identityRegistryAddress).register(agentUri);
        vm.stopBroadcast();

        vm.startBroadcast(clientKey);
        ReputationRegistry(reputationRegistryAddress).giveFeedback(
            agentId,
            90,
            "quality",
            "fast",
            "https://api.example.com",
            "ipfs://feedback",
            keccak256(bytes("sample-feedback"))
        );
        vm.stopBroadcast();
    }
}

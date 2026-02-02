// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract SeedAgent is Script {
    function run(address registryAddress) external {
        // Agent URIs must be unique for testing runs. We derive a fresh key and
        // URI each run so re-running the script does not revert.
        uint256 deployerKey = vm.envUint("ANVIL_DEPLOYER_KEY");
        uint256 agentKey = uint256(
            keccak256(abi.encodePacked(registryAddress, block.number, block.timestamp))
        );
        address agentAddress = vm.addr(agentKey);
        string memory agentUri = string.concat("https://example.com/agents/", vm.toString(agentAddress), ".json");

        if (registryAddress == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }

        vm.startBroadcast(deployerKey);
        (bool funded,) = agentAddress.call{value: 0.01 ether}("");
        require(funded, "Failed to fund agent address");
        vm.stopBroadcast();

        vm.startBroadcast(agentKey);
        IdentityRegistry(registryAddress).register(agentUri);
        vm.stopBroadcast();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

import {ValidationRegistry} from "../src/ValidationRegistry.sol";

contract DeployValidationRegistry is Script {
    using stdJson for string;

    function run(address identityRegistry) external returns (address registry) {
        if (identityRegistry == address(0)) {
            revert("IDENTITY_REGISTRY is required");
        }

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        ValidationRegistry deployed = new ValidationRegistry(identityRegistry);
        registry = address(deployed);

        vm.stopBroadcast();

        string memory root = vm.projectRoot();
        string memory outFile = string.concat(root, "/broadcast/validation-registry.json");
        string memory json = vm.serializeAddress("deployment", "validationRegistry", registry);
        vm.writeJson(json, outFile);
        vm.writeJson(json, outFile, ".deployment");
    }
}

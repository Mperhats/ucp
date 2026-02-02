// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract DeployIdentityRegistry is Script {
    using stdJson for string;

    function run() external returns (address registry) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        IdentityRegistry deployed = new IdentityRegistry();
        registry = address(deployed);

        vm.stopBroadcast();

        string memory root = vm.projectRoot();
        string memory outFile = string.concat(root, "/broadcast/identity-registry.json");
        string memory json = vm.serializeAddress("deployment", "identityRegistry", registry);
        vm.writeJson(json, outFile);
        vm.writeJson(json, outFile, ".deployment");
    }
}

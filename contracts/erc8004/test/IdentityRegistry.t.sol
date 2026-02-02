// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {IIdentityRegistry} from "../src/interfaces/IIdentityRegistry.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry identityRegistry;

    address alice = address(0x1);
    address bob = address(0x2);

    string aliceUri = "https://example.com/alice.json";

    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    function setUp() public {
        identityRegistry = new IdentityRegistry();
    }

    function test_Register() public {
        vm.prank(alice);
        vm.expectEmit(true, false, true, true);
        emit Registered(1, aliceUri, alice);
        uint256 agentId = identityRegistry.register(aliceUri);
        assertEq(agentId, 1);
        assertEq(identityRegistry.ownerOf(agentId), alice);
        assertEq(identityRegistry.tokenURI(agentId), aliceUri);
        assertTrue(identityRegistry.agentExists(agentId));
        assertEq(identityRegistry.totalAgents(), 1);
    }

    function test_RegisterWithMetadata() public {
        IIdentityRegistry.MetadataEntry[] memory entries = new IIdentityRegistry.MetadataEntry[](1);
        entries[0] = IIdentityRegistry.MetadataEntry({
            metadataKey: "foo",
            metadataValue: bytes("bar")
        });

        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri, entries);

        bytes memory value = identityRegistry.getMetadata(agentId, "foo");
        assertEq(value, bytes("bar"));
    }

    function test_SetAgentURI() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        string memory newUri = "https://example.com/alice-updated.json";
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit URIUpdated(agentId, newUri, alice);
        identityRegistry.setAgentURI(agentId, newUri);
        assertEq(identityRegistry.tokenURI(agentId), newUri);
    }

    function test_SetAgentURI_Unauthorized() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectRevert(bytes("Not authorized"));
        identityRegistry.setAgentURI(agentId, "https://example.com/blocked.json");
    }

    function test_SetMetadata_ReservedKey() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(alice);
        vm.expectRevert(bytes("Cannot set agentWallet via setMetadata"));
        identityRegistry.setMetadata(agentId, "agentWallet", bytes("0x00"));
    }

    function test_SetMetadata_Unauthorized() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectRevert(bytes("Not authorized"));
        identityRegistry.setMetadata(agentId, "foo", bytes("bar"));
    }

    function test_SetAgentWallet() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        uint256 newWalletKey = 0xA11CE;
        address newWallet = vm.addr(newWalletKey);
        uint256 deadline = block.timestamp + 1 days;

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC-8004 IdentityRegistry")),
                keccak256(bytes("1.1")),
                block.chainid,
                address(identityRegistry)
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)"),
                agentId,
                newWallet,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newWalletKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(alice);
        identityRegistry.setAgentWallet(agentId, newWallet, deadline, signature);
        assertEq(identityRegistry.getAgentWallet(agentId), newWallet);
    }

    function test_AgentWallet_ResetOnTransfer() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        uint256 newWalletKey = 0xA11CE;
        address newWallet = vm.addr(newWalletKey);
        uint256 deadline = block.timestamp + 1 days;

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC-8004 IdentityRegistry")),
                keccak256(bytes("1.1")),
                block.chainid,
                address(identityRegistry)
            )
        );
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)"),
                agentId,
                newWallet,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newWalletKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(alice);
        identityRegistry.setAgentWallet(agentId, newWallet, deadline, signature);
        assertEq(identityRegistry.getAgentWallet(agentId), newWallet);

        vm.prank(alice);
        identityRegistry.transferFrom(alice, bob, agentId);
        assertEq(identityRegistry.getAgentWallet(agentId), address(0));
    }

    function test_AgentExists_False() public view {
        assertFalse(identityRegistry.agentExists(1));
    }
}

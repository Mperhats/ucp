// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

contract ReputationRegistryTest is Test {
    IdentityRegistry identityRegistry;
    ReputationRegistry reputationRegistry;

    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    string aliceUri = "https://example.com/alice.json";

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

    event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex);

    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI
    );

    function setUp() public {
        identityRegistry = new IdentityRegistry();
        reputationRegistry = new ReputationRegistry(address(identityRegistry));
    }

    function test_GiveFeedback() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit NewFeedback(
            agentId,
            bob,
            1,
            90,
            "quality",
            "fast",
            "https://api.example.com",
            "ipfs://feedback",
            bytes32(0)
        );
        reputationRegistry.giveFeedback(
            agentId,
            90,
            "quality",
            "fast",
            "https://api.example.com",
            "ipfs://feedback",
            bytes32(0)
        );

        (uint8 score, string memory tag1, string memory tag2, bool isRevoked) =
            reputationRegistry.readFeedback(agentId, bob, 1);
        assertEq(score, 90);
        assertEq(tag1, "quality");
        assertEq(tag2, "fast");
        assertFalse(isRevoked);
    }

    function test_GiveFeedback_InvalidScore() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSignature("InvalidScore(uint8,uint8,uint8)", 200, 0, 100));
        reputationRegistry.giveFeedback(agentId, 200, "", "", "", "", bytes32(0));
    }

    function test_RevokeFeedback() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 80, "", "", "", "", bytes32(0));

        vm.prank(bob);
        vm.expectEmit(true, true, true, true);
        emit FeedbackRevoked(agentId, bob, 1);
        reputationRegistry.revokeFeedback(agentId, 1);

        (, , , bool isRevoked) = reputationRegistry.readFeedback(agentId, bob, 1);
        assertTrue(isRevoked);
    }

    function test_RevokeFeedback_InvalidIndex() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSignature("InvalidFeedbackIndex(uint64)", 1));
        reputationRegistry.revokeFeedback(agentId, 1);
    }

    function test_RevokeFeedback_AlreadyRevoked() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 80, "", "", "", "", bytes32(0));

        vm.prank(bob);
        reputationRegistry.revokeFeedback(agentId, 1);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSignature("AlreadyRevoked(uint256,address,uint64)", agentId, bob, 1));
        reputationRegistry.revokeFeedback(agentId, 1);
    }

    function test_AppendResponse_EmptyUri() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSignature("EmptyResponseURI()"));
        reputationRegistry.appendResponse(agentId, bob, 1, "", bytes32(0));
    }

    function test_AppendResponse() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        vm.prank(charlie);
        vm.expectEmit(true, true, true, true);
        emit ResponseAppended(agentId, bob, 1, charlie, "ipfs://response");
        reputationRegistry.appendResponse(agentId, bob, 1, "ipfs://response", bytes32(0));
    }

    function test_AppendResponse_InvalidIndex() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(charlie);
        vm.expectRevert(abi.encodeWithSignature("InvalidFeedbackIndex(uint64)", 1));
        reputationRegistry.appendResponse(agentId, bob, 1, "ipfs://response", bytes32(0));
    }

    function test_GetSummary() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 60, "a", "", "", "", bytes32(0));

        vm.prank(charlie);
        reputationRegistry.giveFeedback(agentId, 80, "a", "", "", "", bytes32(0));

        (uint64 count, uint8 average) =
            reputationRegistry.getSummary(agentId, new address[](0), "a", "");
        assertEq(count, 2);
        assertEq(average, 70);
    }

    function test_ReadAllFeedback_IncludeRevoked() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 60, "a", "", "", "", bytes32(0));

        vm.prank(bob);
        reputationRegistry.revokeFeedback(agentId, 1);

        (
            address[] memory clients,
            uint64[] memory feedbackIndexes,
            uint8[] memory scores,
            string[] memory tag1s,
            string[] memory tag2s,
            bool[] memory revokedStatuses
        ) = reputationRegistry.readAllFeedback(agentId, new address[](0), "", "", true);

        assertEq(clients.length, 1);
        assertEq(feedbackIndexes[0], 1);
        assertEq(scores[0], 60);
        assertEq(tag1s[0], "a");
        assertEq(tag2s[0], "");
        assertTrue(revokedStatuses[0]);
    }

    function test_GetResponseCount() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        vm.prank(charlie);
        reputationRegistry.appendResponse(agentId, bob, 1, "ipfs://response", bytes32(0));

        address[] memory responders = new address[](1);
        responders[0] = charlie;
        uint64 count = reputationRegistry.getResponseCount(agentId, bob, 1, responders);
        assertEq(count, 1);
    }

    function test_GetClientsAndLastIndex() public {
        vm.prank(alice);
        uint256 agentId = identityRegistry.register(aliceUri);

        vm.prank(bob);
        reputationRegistry.giveFeedback(agentId, 70, "", "", "", "", bytes32(0));

        address[] memory clients = reputationRegistry.getClients(agentId);
        assertEq(clients.length, 1);
        assertEq(clients[0], bob);
        assertEq(reputationRegistry.getLastIndex(agentId, bob), 1);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SliceBattle} from "../src/SliceBattle.sol";

contract DeployScript is Script {
    function run() external {
        // Use PRIVATE_KEY env var, or --private-key when running forge script
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        SliceBattle game = new SliceBattle();

        vm.stopBroadcast();

        console.log("SliceBattle deployed at:", address(game));
    }
}

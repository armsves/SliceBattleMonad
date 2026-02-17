// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SliceBattle {
    struct Slice {
        uint24 size;
        int8 x;
        int8 y;
        uint32 respawn;
        uint16 eats;
        uint16 toppingEats;
    }

    struct Topping {
        int8 x;
        int8 y;
        uint8 toppingId;
        uint32 eatenAt;
    }

    mapping(address => Slice) public slices;
    mapping(uint256 => address) public leaderboard;
    mapping(uint256 => Topping) public toppings;

    uint256 public constant ARENA_SIZE = 64;
    int8 public constant HALF_ARENA = 32; // ARENA_SIZE / 2
    uint256 public constant START_SIZE = 1000;
    uint256 public constant MAX_SIZE = 10000000;
    uint256 public constant RESPAWN_DELAY = 5;
    uint256 public constant TOPPING_COUNT = 20;
    uint256 public constant EAT_THRESHOLD = 120;

    uint256 public leaderboardSize;
    address public owner;

    event SliceMoved(address indexed player, int8 x, int8 y, uint24 size);
    event SliceAtePlayer(address indexed eater, address indexed eaten, uint24 newSize);
    event SliceAteTopping(address indexed player, uint8 toppingId, uint24 newSize);
    event SliceRespawned(address indexed player, int8 x, int8 y);
    event LeaderboardUpdated(address indexed player, uint256 position, uint24 size);

    constructor() {
        owner = msg.sender;
        leaderboardSize = 0;
        _initializeToppings();
    }

    function _initializeToppings() internal {
        for (uint256 i = 1; i <= TOPPING_COUNT; i++) {
            (int8 xPos, int8 yPos) = _randomPos(i * 7, i * 13);
            toppings[i] = Topping({
                x: xPos,
                y: yPos,
                toppingId: uint8(_pseudoRandom(i * 3) % 3),
                eatenAt: 0
            });
        }
    }

    function _pseudoRandom(uint256 seed) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, seed)));
    }

    /// @notice Returns random (x,y) in [-32, 31]. Safe: ARENA_SIZE=64 so mod gives [0,63], minus 32 fits in int8.
    function _randomPos(uint256 seedX, uint256 seedY) internal view returns (int8 x, int8 y) {
        unchecked {
            uint256 half = ARENA_SIZE / 2;
            // forge-lint: disable-next-line(unsafe-typecast)
            int256 h = int256(half);
            // forge-lint: disable-next-line(unsafe-typecast)
            x = int8(int256(_pseudoRandom(seedX) % ARENA_SIZE) - h);
            // forge-lint: disable-next-line(unsafe-typecast)
            y = int8(int256(_pseudoRandom(seedY) % ARENA_SIZE) - h);
        }
    }

    function move(int8 dx, int8 dy) external {
        Slice storage s = slices[msg.sender];

        if (s.respawn > 0 && block.number < s.respawn) revert("Still respawning");

        if (s.size == 0) {
            // forge-lint: disable-next-line(unsafe-typecast)
            s.size = uint24(START_SIZE);
            (s.x, s.y) = _randomPos(uint256(uint160(msg.sender)), uint256(uint160(msg.sender)) * 2);
            s.respawn = 0;
            s.eats = 0;
            s.toppingEats = 0;
        }

        int8 newX = s.x + dx;
        int8 newY = s.y + dy;

        if (newX < -HALF_ARENA || newX >= HALF_ARENA || newY < -HALF_ARENA || newY >= HALF_ARENA) revert("Out of bounds");

        s.x = newX;
        s.y = newY;

        for (uint256 i = 1; i <= TOPPING_COUNT; i++) {
            Topping storage t = toppings[i];
            if (t.eatenAt == 0 && t.x == newX && t.y == newY) {
                uint24 growth = uint24(200 + (t.toppingId * 100));
                s.size = uint24(_min(uint256(s.size) + growth, MAX_SIZE));
                s.toppingEats++;
                t.eatenAt = uint32(block.number);
                emit SliceAteTopping(msg.sender, t.toppingId, s.size);
                _scheduleToppingRespawn(i);
                break;
            }
        }

        if (s.size >= START_SIZE * 2) {
            address eaten = _checkPlayerCollision(newX, newY, s.size);
            if (eaten != address(0)) {
                Slice storage target = slices[eaten];
                uint24 sizeGain = uint24(target.size / 2);
                s.size = uint24(_min(uint256(s.size) + sizeGain, MAX_SIZE));
                s.eats++;
                target.size = 0;
                // forge-lint: disable-next-line(unsafe-typecast)
                target.respawn = uint32(block.number + RESPAWN_DELAY);
                target.x = 0;
                target.y = 0;
                emit SliceAtePlayer(msg.sender, eaten, s.size);
            }
        }

        _updateLeaderboard(msg.sender, s.size);
        emit SliceMoved(msg.sender, newX, newY, s.size);
    }

    function _checkPlayerCollision(int8 x, int8 y, uint24 size) internal view returns (address) {
        uint256 threshold = (uint256(size) * 100) / EAT_THRESHOLD;
        address current = msg.sender;
        for (uint160 i = 1; i < 1000; i++) {
            address player = address(i);
            if (player != current) {
                Slice memory target = slices[player];
                if (target.size > 0 && target.respawn == 0 && target.x == x && target.y == y && uint256(target.size) < threshold) {
                    return player;
                }
            }
        }
        return address(0);
    }

    function _scheduleToppingRespawn(uint256 id) internal {
        Topping storage t = toppings[id];
        uint256 bn = block.number;
        (t.x, t.y) = _randomPos(id * bn, id * bn * 2);
        t.eatenAt = 0;
    }

    function _updateLeaderboard(address player, uint24 size) internal {
        for (uint256 i = 1; i <= 5; i++) {
            if (leaderboard[i] == address(0) || slices[leaderboard[i]].size < size) {
                for (uint256 j = 5; j > i; j--) leaderboard[j] = leaderboard[j - 1];
                leaderboard[i] = player;
                emit LeaderboardUpdated(player, i, size);
                return;
            }
        }
        if (leaderboardSize < 5) {
            leaderboardSize++;
            leaderboard[leaderboardSize] = player;
            emit LeaderboardUpdated(player, leaderboardSize, size);
        }
    }

    function respawn() external {
        Slice storage s = slices[msg.sender];
        if (s.respawn == 0 || block.number < s.respawn) revert("Not ready to respawn");
        // forge-lint: disable-next-line(unsafe-typecast)
        s.size = uint24(START_SIZE);
        uint256 bn = block.number;
        (s.x, s.y) = _randomPos(uint256(uint160(msg.sender)) * bn, uint256(uint160(msg.sender)) * bn * 2);
        s.respawn = 0;
        emit SliceRespawned(msg.sender, s.x, s.y);
    }

    function getSlice(address player) external view returns (Slice memory) {
        return slices[player];
    }

    function getTopping(uint256 id) external view returns (Topping memory) {
        return toppings[id];
    }

    function getLeaderboard() external view returns (address[5] memory) {
        address[5] memory result;
        for (uint256 i = 0; i < 5; i++) result[i] = leaderboard[i + 1];
        return result;
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = '0x3879441B57eF716578efD5E36130BEFe95740417' as `0x${string}`;

export const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'int8', name: 'dx', type: 'int8' }, { internalType: 'int8', name: 'dy', type: 'int8' }],
    name: 'move',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respawn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getSlice',
    outputs: [
      {
        components: [
          { internalType: 'uint24', name: 'size', type: 'uint24' },
          { internalType: 'int8', name: 'x', type: 'int8' },
          { internalType: 'int8', name: 'y', type: 'int8' },
          { internalType: 'uint32', name: 'respawn', type: 'uint32' },
          { internalType: 'uint16', name: 'eats', type: 'uint16' },
          { internalType: 'uint16', name: 'toppingEats', type: 'uint16' },
        ],
        internalType: 'struct SliceBattle.Slice',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getTopping',
    outputs: [
      {
        components: [
          { internalType: 'int8', name: 'x', type: 'int8' },
          { internalType: 'int8', name: 'y', type: 'int8' },
          { internalType: 'uint8', name: 'toppingId', type: 'uint8' },
          { internalType: 'uint32', name: 'eatenAt', type: 'uint32' },
        ],
        internalType: 'struct SliceBattle.Topping',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLeaderboard',
    outputs: [{ internalType: 'address[5]', name: '', type: 'address[5]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'int8', name: 'x', type: 'int8' },
      { indexed: false, internalType: 'int8', name: 'y', type: 'int8' },
      { indexed: false, internalType: 'uint24', name: 'size', type: 'uint24' },
    ],
    name: 'SliceMoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'eater', type: 'address' },
      { indexed: true, internalType: 'address', name: 'eaten', type: 'address' },
      { indexed: false, internalType: 'uint24', name: 'newSize', type: 'uint24' },
    ],
    name: 'SliceAtePlayer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'toppingId', type: 'uint8' },
      { indexed: false, internalType: 'uint24', name: 'newSize', type: 'uint24' },
    ],
    name: 'SliceAteTopping',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'player', type: 'address' },
      { indexed: false, internalType: 'int8', name: 'x', type: 'int8' },
      { indexed: false, internalType: 'int8', name: 'y', type: 'int8' },
    ],
    name: 'SliceRespawned',
    type: 'event',
  },
] as const;

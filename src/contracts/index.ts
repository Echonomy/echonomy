export const contracts = {
  EchonomySongRegistry: [
    {
      type: "function",
      name: "createSongContract",
      inputs: [
        { name: "name", type: "string", internalType: "string" },
        { name: "price", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getSong",
      inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
      outputs: [
        {
          name: "",
          type: "address",
          internalType: "contract EchonomySong",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSongCount",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSongOwner",
      inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSongPrice",
      inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "mintSong",
      inputs: [
        { name: "index", type: "uint256", internalType: "uint256" },
        { name: "to", type: "address", internalType: "address" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "withdraw",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],
} as const;

export type ContractName = keyof typeof contracts;

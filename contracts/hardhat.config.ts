import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "dotenv/config";

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ABSTRACT_RPC_URL = process.env.ABSTRACT_RPC_URL || "https://rpc.abstract.network";
const ABSTRACT_ARCHIVE_RPC_URL = process.env.ABSTRACT_ARCHIVE_RPC_URL || ABSTRACT_RPC_URL;
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER ? parseInt(process.env.FORK_BLOCK_NUMBER) : undefined;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: ABSTRACT_ARCHIVE_RPC_URL,
        blockNumber: FORK_BLOCK_NUMBER,
        enabled: process.env.ENABLE_FORKING === "true",
      },
    },
    abstract: {
      url: ABSTRACT_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    local: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config; 
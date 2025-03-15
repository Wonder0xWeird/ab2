import { ethers } from "hardhat";

/**
 * This script demonstrates how to interact with existing contracts
 * on a forked Abstract network.
 */
async function main() {
  console.log("Running on forked Abstract network...");

  // Get the current network
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);
  console.log(`Current block number: ${blockNumber}`);

  // Get a signer
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  const balance = await provider.getBalance(signer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // Example: Interact with an existing contract on the forked network
  // This would be replaced with actual Abstract contract addresses
  // const existingContractAddress = "0x...";
  // const existingContract = await ethers.getContractAt("ContractInterface", existingContractAddress);
  // const result = await existingContract.someFunction();
  // console.log("Result:", result);

  // Example: Deploy a contract on the forked network
  console.log("Deploying test contract to forked network...");

  // Use our DiamondCutFacet as an example
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();

  console.log(`Test contract deployed to: ${await diamondCutFacet.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
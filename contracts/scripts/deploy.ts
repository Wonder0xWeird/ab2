import { ethers } from "hardhat";
import { getSelectors, FacetCutAction } from "./libraries/diamond";

async function main() {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  console.log("Deploying Diamond contract with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy DiamondCutFacet
  console.log("Deploying DiamondCutFacet...");
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();
  console.log("DiamondCutFacet deployed to:", await diamondCutFacet.getAddress());

  // Deploy Diamond
  console.log("Deploying Diamond...");
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    deployer.address,
    await diamondCutFacet.getAddress()
  );
  await diamond.waitForDeployment();
  const diamondAddress = await diamond.getAddress();
  console.log("Diamond deployed to:", diamondAddress);

  // Deploy DiamondLoupeFacet
  console.log("Deploying DiamondLoupeFacet...");
  const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet");
  const diamondLoupeFacet = await DiamondLoupeFacet.deploy();
  await diamondLoupeFacet.waitForDeployment();
  console.log("DiamondLoupeFacet deployed to:", await diamondLoupeFacet.getAddress());

  // Deploy OwnershipFacet
  console.log("Deploying OwnershipFacet...");
  const OwnershipFacet = await ethers.getContractFactory("OwnershipFacet");
  const ownershipFacet = await OwnershipFacet.deploy();
  await ownershipFacet.waitForDeployment();
  console.log("OwnershipFacet deployed to:", await ownershipFacet.getAddress());

  // Attach DiamondCutFacet to diamond
  const diamondCutContract = await ethers.getContractAt("DiamondCutFacet", diamondAddress);

  // Get selectors for DiamondLoupeFacet
  const diamondLoupeFacetSelectors = getSelectors(diamondLoupeFacet);

  // Get selectors for OwnershipFacet
  const ownershipFacetSelectors = getSelectors(ownershipFacet);

  // Add DiamondLoupeFacet and OwnershipFacet to diamond
  console.log("Adding DiamondLoupeFacet and OwnershipFacet to Diamond...");
  const tx = await diamondCutContract.diamondCut(
    [
      {
        facetAddress: await diamondLoupeFacet.getAddress(),
        action: FacetCutAction.Add,
        functionSelectors: diamondLoupeFacetSelectors,
      },
      {
        facetAddress: await ownershipFacet.getAddress(),
        action: FacetCutAction.Add,
        functionSelectors: ownershipFacetSelectors,
      },
    ],
    ethers.ZeroAddress, // No initialization
    "0x" // No calldata
  );

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) {
    console.error("Diamond cut failed!");
    process.exit(1);
  }

  console.log("Diamond deployment complete!");
  console.log("-----------------------------------");
  console.log("Diamond address:", diamondAddress);
  console.log("DiamondCutFacet address:", await diamondCutFacet.getAddress());
  console.log("DiamondLoupeFacet address:", await diamondLoupeFacet.getAddress());
  console.log("OwnershipFacet address:", await ownershipFacet.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
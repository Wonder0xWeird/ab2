import { ethers } from "hardhat";
import { impersonateAccount, setBalance, upgradeExistingDiamond } from "./devnet-helper";

/**
 * This script demonstrates how to upgrade an existing Diamond contract
 * on a forked Abstract network.
 */
async function main() {
  console.log("Running diamond upgrade on forked Abstract network...");

  // Get the current network
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`);

  // For the demo, we'll need:
  // 1. The address of an existing Diamond contract on Abstract
  // 2. The address of the owner of that Diamond contract

  // These would be replaced with actual addresses from Abstract
  const existingDiamondAddress = process.env.EXISTING_DIAMOND_ADDRESS || "0x...";
  const diamondOwnerAddress = process.env.DIAMOND_OWNER_ADDRESS || "0x...";

  console.log(`Using Diamond at ${existingDiamondAddress}`);
  console.log(`Owner address: ${diamondOwnerAddress}`);

  // Give the owner some ETH for transactions
  await setBalance(diamondOwnerAddress, 10);

  // Impersonate the owner so we can make calls as them
  const ownerSigner = await impersonateAccount(diamondOwnerAddress);
  console.log(`Successfully impersonating owner: ${await ownerSigner.getAddress()}`);

  // Deploy a new TestFacet contract
  console.log("Deploying new TestFacet...");
  const TestFacet = await ethers.getContractFactory("TestFacet");
  const testFacet = await TestFacet.deploy();
  await testFacet.waitForDeployment();
  console.log(`TestFacet deployed at: ${await testFacet.getAddress()}`);

  // Connect to the existing diamond with the owner signer
  const diamondCut = await ethers.getContractAt(
    "DiamondCutFacet",
    existingDiamondAddress,
    ownerSigner
  );

  // Upgrade the Diamond with the new TestFacet
  console.log("Upgrading Diamond with TestFacet...");
  await upgradeExistingDiamond({
    diamondAddress: existingDiamondAddress,
    facetName: "TestFacet",
    facetContract: testFacet,
  });

  // Verify the upgrade by interacting with the new facet
  const diamondAsTestFacet = await ethers.getContractAt(
    "TestFacet",
    existingDiamondAddress
  );

  // Set a value using the new facet
  const testValue = 42;
  await diamondAsTestFacet.setValue(testValue);

  // Read the value back
  const storedValue = await diamondAsTestFacet.getValue();
  console.log(`Test successful! Set value: ${testValue}, Retrieved value: ${storedValue}`);

  console.log("Diamond upgrade completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
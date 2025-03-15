import { ethers } from "hardhat";
import { FacetCutAction, getSelectors } from "./libraries/diamond";
import { Contract } from "ethers";

/**
 * Helper functions for working with a local forked network
 */
export async function impersonateAccount(address: string) {
  await ethers.provider.send("anvil_impersonateAccount", [address]);
  const signer = await ethers.provider.getSigner(address);
  return signer;
}

export async function stopImpersonatingAccount(address: string) {
  await ethers.provider.send("anvil_stopImpersonatingAccount", [address]);
}

export async function setBalance(address: string, balanceInEth: number) {
  const balanceInWei = ethers.parseEther(balanceInEth.toString());
  await ethers.provider.send("anvil_setBalance", [
    address,
    `0x${balanceInWei.toString(16)}`,
  ]);
}

export async function mineBlocks(count: number) {
  for (let i = 0; i < count; i++) {
    await ethers.provider.send("evm_mine", []);
  }
}

/**
 * Helper for upgrading a Diamond contract on the forked network
 */
export async function upgradeExistingDiamond({
  diamondAddress,
  facetName,
  facetContract,
  action = FacetCutAction.Add,
  initContract = ethers.ZeroAddress,
  initData = "0x",
}: {
  diamondAddress: string;
  facetName: string;
  facetContract: Contract;
  action?: FacetCutAction;
  initContract?: string;
  initData?: string;
}) {
  console.log(`Upgrading Diamond at ${diamondAddress} with ${facetName}`);

  // Connect to the existing diamond
  const diamondCut = await ethers.getContractAt(
    "DiamondCutFacet",
    diamondAddress
  );

  // Get function selectors for the facet
  const selectors = getSelectors(facetContract);
  console.log(`Adding ${selectors.length} function selectors`);

  // Perform the upgrade
  const tx = await diamondCut.diamondCut(
    [
      {
        facetAddress: await facetContract.getAddress(),
        action,
        functionSelectors: selectors,
      },
    ],
    initContract,
    initData
  );

  // Wait for the transaction
  const receipt = await tx.wait();
  console.log(`Upgrade complete. Gas used: ${receipt?.gasUsed.toString()}`);

  return receipt;
}

/**
 * Example of how to use the helpers
 */
async function example() {
  // Example: Impersonate an account that has permissions on Abstract
  const ownerAddress = "0x..."; // Replace with real address from the forked chain
  await setBalance(ownerAddress, 10); // Give it some ETH
  const ownerSigner = await impersonateAccount(ownerAddress);

  // Example: Deploy a new facet
  const TestFacet = await ethers.getContractFactory("TestFacet");
  const testFacet = await TestFacet.deploy();
  await testFacet.waitForDeployment();

  // Example: Upgrade an existing diamond with the new facet
  const existingDiamondAddress = "0x..."; // Replace with real diamond address
  await upgradeExistingDiamond({
    diamondAddress: existingDiamondAddress,
    facetName: "TestFacet",
    facetContract: testFacet,
  });

  // Clean up
  await stopImpersonatingAccount(ownerAddress);
}

// This can be run directly with: npx hardhat run scripts/devnet-helper.ts --network localhost
if (require.main === module) {
  example()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 
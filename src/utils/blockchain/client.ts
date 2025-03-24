/**
 * Blockchain client class for ABSTRACTU
 * Interacts with Abstract blockchain and ContributionFacet smart contract
 */
import { ethers } from 'ethers';

// Interface for the ABI to allow for testing without needing the actual artifact
interface ContractABI {
  abi: Array<string | object>;
}

// Define a mock ABI for development when actual ABI isn't available
const MOCK_CONTRIBUTION_FACET_ABI: ContractABI = {
  abi: [
    // Core functions from ContributionFacet.sol
    "function initializeContribution(string calldata _title, string calldata _description) external returns (uint256)",
    "function accept(uint256 _contributionId, string calldata _contentHash, uint256 _evaluationScore) external",
    "function reject(uint256 _contributionId, uint256 _evaluationScore) external",
    "function getContribution(uint256 _contributionId) external view returns (uint256 id, address contributor, string memory contentHash, string memory title, string memory description, uint8 status, uint256 evaluationScore, uint256 timestamp, uint16 version)",
    "function getConfiguration() external view returns (uint256 acceptanceThreshold, uint256 blacklistThreshold, uint16 facetVersion)",
    "function meetsAcceptanceThreshold(uint256 _score) external view returns (bool)"
  ]
};

// Get ABI from mock only - no dynamic imports
function getContractABI(): ContractABI {
  // Using mock ABI for now
  console.warn('Using mock ContributionFacet ABI. For production, provide the real artifact.');
  return MOCK_CONTRIBUTION_FACET_ABI;
}

/**
 * Interface for contribution data
 */
export interface ContributionData {
  id: number;
  contributor: string;
  contentHash: string;
  title: string;
  description: string;
  status: number;
  evaluationScore: number;
  timestamp: number;
  version: number;
}

// Interface for contract log
interface ContractLog {
  topics: string[];
  data: string;
}

// Interface for event args
interface EventWithArgs {
  name: string;
  args: Record<string, unknown>;
}

/**
 * Blockchain client class
 */
export class BlockchainClient {
  private static instance: BlockchainClient;
  private provider: ethers.JsonRpcProvider;
  private contractAddress: string;
  private contract: ethers.Contract | null = null;
  private initialized = false;
  private adminWallet: ethers.Wallet | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    const rpcUrl = process.env.ABSTRACT_RPC_URL || '';
    const contractAddress = process.env.CONTRIBUTION_FACET_ADDRESS || '';
    const privateKey = process.env.ACRONTU_PRIVATE_KEY || '';

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;

    // Create admin wallet if private key is available
    if (privateKey) {
      this.adminWallet = new ethers.Wallet(privateKey, this.provider);
    }
  }

  /**
   * Get singleton instance of Blockchain client
   */
  public static getInstance(): BlockchainClient {
    if (!BlockchainClient.instance) {
      BlockchainClient.instance = new BlockchainClient();
    }
    return BlockchainClient.instance;
  }

  /**
   * Initialize the blockchain client
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.contractAddress) {
      throw new Error('Contract address not provided in environment variables');
    }

    if (!this.adminWallet) {
      throw new Error('ACRONTU private key not provided in environment variables');
    }

    try {
      // Get contract ABI
      const contractABI = getContractABI();

      // Create contract instance
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI.abi,
        this.adminWallet
      );

      this.initialized = true;
      console.log('Blockchain client initialized');
    } catch (err) {
      console.error('Blockchain client initialization error:', err);
      throw err;
    }
  }

  /**
   * Validate client is initialized
   */
  private validateInitialized(): void {
    if (!this.initialized || !this.contract) {
      throw new Error('Blockchain client not initialized. Call initialize() first.');
    }
  }

  /**
   * Register a new contribution intent
   * @param title Title of the contribution
   * @param description Description of the contribution
   * @param contributorAddress Address of the contributor
   * @returns Promise resolving to the contribution ID
   */
  public async registerContributionIntent(
    title: string,
    description: string,
    contributorAddress: string
  ): Promise<number> {
    this.validateInitialized();

    try {
      // Connect as contributor if different from admin
      const connectedContract = this.contract;
      if (contributorAddress.toLowerCase() !== this.adminWallet?.address.toLowerCase()) {
        // Note: In production, this would use the contributor's signed transaction
        // For now, we use the admin wallet but could implement EIP-712 for proper authorization
        console.warn('Using admin wallet to submit on behalf of contributor');
      }

      // Call the contract
      const tx = await connectedContract?.initializeContribution(title, description);
      const receipt = await tx.wait();

      // Get contribution ID from events
      const event = receipt.logs
        .map((log: ContractLog) => {
          try {
            return this.contract?.interface.parseLog({
              topics: log.topics,
              data: log.data
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            return null;
          }
        })
        .find((event: EventWithArgs | null) => event?.name === 'ContributionInitialized');

      if (!event || !event.args) {
        throw new Error('Failed to find ContributionInitialized event');
      }

      return Number(event.args.contributionId);
    } catch (err) {
      console.error('Register contribution intent error:', err);
      throw new Error(`Failed to register contribution intent: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  /**
   * Accept a contribution
   * @param contributionId ID of the contribution
   * @param contentHash Filecoin CID of the content
   * @param evaluationScore Score assigned to the contribution
   * @returns Promise resolving to transaction receipt
   */
  public async acceptContribution(
    contributionId: number,
    contentHash: string,
    evaluationScore: number
  ): Promise<ethers.TransactionReceipt> {
    this.validateInitialized();

    try {
      // Call the contract
      const tx = await this.contract?.accept(contributionId, contentHash, evaluationScore);
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error('Accept contribution error:', error);
      throw new Error(`Failed to accept contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reject a contribution
   * @param contributionId ID of the contribution
   * @param evaluationScore Score assigned to the contribution
   * @returns Promise resolving to transaction receipt
   */
  public async rejectContribution(
    contributionId: number,
    evaluationScore: number
  ): Promise<ethers.TransactionReceipt> {
    this.validateInitialized();

    try {
      // Call the contract
      const tx = await this.contract?.reject(contributionId, evaluationScore);
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error('Reject contribution error:', error);
      throw new Error(`Failed to reject contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a contribution by ID
   * @param contributionId ID of the contribution
   * @returns Promise resolving to the contribution data
   */
  public async getContribution(contributionId: number): Promise<ContributionData> {
    this.validateInitialized();

    try {
      // Call the contract
      const result = await this.contract?.getContribution(contributionId);

      // Convert to ContributionData interface
      return {
        id: Number(result[0]),
        contributor: result[1],
        contentHash: result[2],
        title: result[3],
        description: result[4],
        status: Number(result[5]),
        evaluationScore: Number(result[6]),
        timestamp: Number(result[7]),
        version: Number(result[8]),
      };
    } catch (error) {
      console.error('Get contribution error:', error);
      throw new Error(`Failed to get contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration values
   * @returns Promise resolving to the configuration values
   */
  public async getConfiguration(): Promise<{
    acceptanceThreshold: number;
    blacklistThreshold: number;
    facetVersion: number;
  }> {
    this.validateInitialized();

    try {
      // Call the contract
      const result = await this.contract?.getConfiguration();

      // Convert to configuration object
      return {
        acceptanceThreshold: Number(result[0]),
        blacklistThreshold: Number(result[1]),
        facetVersion: Number(result[2]),
      };
    } catch (error) {
      console.error('Get configuration error:', error);
      throw new Error(`Failed to get configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a score meets the acceptance threshold
   * @param score Score to check
   * @returns Promise resolving to boolean
   */
  public async meetsAcceptanceThreshold(score: number): Promise<boolean> {
    this.validateInitialized();

    try {
      return await this.contract?.meetsAcceptanceThreshold(score);
    } catch (error) {
      console.error('Check acceptance threshold error:', error);
      throw new Error(`Failed to check acceptance threshold: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a contribution exists
   * @param contributionId ID of the contribution
   * @returns Promise resolving to boolean
   */
  public async contributionExists(contributionId: number): Promise<boolean> {
    try {
      await this.getContribution(contributionId);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  }
} 
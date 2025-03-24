/**
 * ACRONTU evaluation service class
 * Orchestrates the contribution evaluation process
 */
import { MongoDBClient, getContributionDraftModel, getEvaluationResultCacheModel } from '../mongodb';
import { IContributionDraft } from '../mongodb/models/ContributionDraft';
import { FilecoinClient, FilecoinContent } from '../filecoin';
import { BlockchainClient } from '../blockchain';
import { AIEvaluator, AggregatedEvaluation } from '../ai';
import { IEvaluationResultCache } from '../mongodb/models/EvaluationResultCache';

/**
 * Contribution evaluation status types
 */
export type ContributionStatus = 'draft' | 'pending' | 'processing' | 'approved' | 'rejected';

/**
 * EvaluationResult interface for caching
 */
export interface EvaluationResult {
  contributionId: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  feedback: string;
  timestamp: Date;
}

/**
 * ACRONTU evaluation service class
 */
export class ACRONTUEvaluationService {
  private static instance: ACRONTUEvaluationService;
  private mongoClient: MongoDBClient;
  private filecoinClient: FilecoinClient;
  private blockchainClient: BlockchainClient;
  private aiEvaluator: AIEvaluator;
  private initialized = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.mongoClient = MongoDBClient.getInstance();
    this.filecoinClient = FilecoinClient.getInstance();
    this.blockchainClient = BlockchainClient.getInstance();
    this.aiEvaluator = AIEvaluator.getInstance();
  }

  /**
   * Get singleton instance of ACRONTU evaluation service
   */
  public static getInstance(): ACRONTUEvaluationService {
    if (!ACRONTUEvaluationService.instance) {
      ACRONTUEvaluationService.instance = new ACRONTUEvaluationService();
    }
    return ACRONTUEvaluationService.instance;
  }

  /**
   * Initialize the ACRONTU evaluation service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize all dependencies
      await this.mongoClient.connect();
      await this.blockchainClient.initialize();
      await this.aiEvaluator.initialize();

      this.initialized = true;
      console.log('ACRONTU evaluation service initialized');
    } catch (error) {
      console.error('ACRONTU evaluation service initialization error:', error);
      throw error;
    }
  }

  /**
   * Validate that the service is initialized
   */
  private validateInitialized(): void {
    if (!this.initialized) {
      throw new Error('ACRONTU evaluation service not initialized. Call initialize() first.');
    }
  }

  /**
   * Process a single contribution
   * @param contributionId ID of the contribution to process
   */
  public async processContribution(contributionId: string): Promise<void> {
    this.validateInitialized();

    console.log(`Processing contribution: ${contributionId}`);

    try {
      // Get the contribution from MongoDB
      const ContributionDraft = getContributionDraftModel();
      const contribution = await ContributionDraft.findById(contributionId);

      if (!contribution) {
        throw new Error(`Contribution not found: ${contributionId}`);
      }

      // Check if the contribution is in pending status
      if (contribution.status !== 'pending') {
        console.log(`Skipping contribution ${contributionId} with status ${contribution.status}`);
        return;
      }

      // Update status to processing
      contribution.status = 'processing';
      await contribution.save();

      // Evaluate the contribution
      const evaluationResult = await this.evaluateContribution(contribution);

      // Get acceptance threshold from blockchain
      const config = await this.blockchainClient.getConfiguration();
      const acceptanceThreshold = config.acceptanceThreshold;

      // Handle evaluation result
      if (evaluationResult.overallScore >= acceptanceThreshold) {
        await this.handleAcceptedContribution(contribution, evaluationResult);
      } else {
        await this.handleRejectedContribution(contribution, evaluationResult);
      }

      console.log(`Successfully processed contribution: ${contributionId}`);
    } catch (error) {
      console.error(`Error processing contribution ${contributionId}:`, error);

      // Update status back to pending on error
      try {
        const ContributionDraft = getContributionDraftModel();
        const contribution = await ContributionDraft.findById(contributionId);
        if (contribution && contribution.status === 'processing') {
          contribution.status = 'pending';
          await contribution.save();
        }
      } catch (updateError) {
        console.error(`Error updating contribution status after failed processing:`, updateError);
      }

      throw error;
    }
  }

  /**
   * Evaluate a contribution using AI models
   * @param contribution The contribution to evaluate
   */
  private async evaluateContribution(contribution: IContributionDraft): Promise<AggregatedEvaluation> {
    console.log(`Evaluating contribution: ${contribution._id}`);

    return await this.aiEvaluator.evaluateContribution({
      title: contribution.title,
      description: contribution.description,
      content: contribution.content
    });
  }

  /**
   * Handle an accepted contribution
   * @param contribution The accepted contribution
   * @param evaluationResult The evaluation result
   */
  private async handleAcceptedContribution(
    contribution: IContributionDraft,
    evaluationResult: AggregatedEvaluation
  ): Promise<void> {
    console.log(`Accepting contribution: ${contribution._id}`);

    try {
      // 1. Store the content on Filecoin
      const filecoinCid = await this.storeOnFilecoin(contribution, evaluationResult);

      // 2. Update the contribution in MongoDB
      contribution.status = 'approved';
      contribution.evaluationScore = evaluationResult.overallScore;
      contribution.evaluationFeedback = evaluationResult.feedback;
      contribution.evaluationTimestamp = new Date();
      contribution.filecoinCid = filecoinCid;
      await contribution.save();

      // 3. Register acceptance on blockchain
      let blockchainId = contribution.blockchainId;

      // If no blockchain ID, register a new contribution intent
      if (!blockchainId) {
        const newId = await this.blockchainClient.registerContributionIntent(
          contribution.title,
          contribution.description,
          contribution.contributorAddress
        );

        blockchainId = newId;
        contribution.blockchainId = newId;
        await contribution.save();
      }

      // Accept the contribution on the blockchain
      await this.blockchainClient.acceptContribution(
        blockchainId,
        filecoinCid,
        evaluationResult.overallScore
      );

      // 4. Cache the evaluation result
      await this.cacheEvaluationResult(contribution._id.toString(), evaluationResult);

      console.log(`Successfully accepted contribution: ${contribution._id}`);
    } catch (error) {
      console.error(`Error accepting contribution ${contribution._id}:`, error);
      throw error;
    }
  }

  /**
   * Handle a rejected contribution
   * @param contribution The rejected contribution
   * @param evaluationResult The evaluation result
   */
  private async handleRejectedContribution(
    contribution: IContributionDraft,
    evaluationResult: AggregatedEvaluation
  ): Promise<void> {
    console.log(`Rejecting contribution: ${contribution._id}`);

    try {
      // 1. Update the contribution in MongoDB
      contribution.status = 'rejected';
      contribution.evaluationScore = evaluationResult.overallScore;
      contribution.evaluationFeedback = evaluationResult.feedback;
      contribution.evaluationTimestamp = new Date();
      await contribution.save();

      // 2. Register rejection on blockchain (if there's a blockchain ID)
      if (contribution.blockchainId) {
        await this.blockchainClient.rejectContribution(
          contribution.blockchainId,
          evaluationResult.overallScore
        );
      }

      // 3. Cache the evaluation result
      await this.cacheEvaluationResult(contribution._id.toString(), evaluationResult);

      console.log(`Successfully rejected contribution: ${contribution._id}`);
    } catch (error) {
      console.error(`Error rejecting contribution ${contribution._id}:`, error);
      throw error;
    }
  }

  /**
   * Store a contribution on Filecoin
   * @param contribution The contribution to store
   * @param evaluationResult The evaluation result
   */
  private async storeOnFilecoin(
    contribution: IContributionDraft,
    evaluationResult: AggregatedEvaluation
  ): Promise<string> {
    console.log(`Storing contribution on Filecoin: ${contribution._id}`);

    // Prepare the content package
    const contentPackage: FilecoinContent = {
      content: contribution.content,
      metadata: {
        title: contribution.title,
        description: contribution.description,
        contributorAddress: contribution.contributorAddress,
        timestamp: new Date().toISOString(),
        evaluationScore: evaluationResult.overallScore,
        criteriaScores: evaluationResult.criteriaScores,
        evaluationFeedback: evaluationResult.feedback,
        parentContributionId: contribution.parentContributionId,
        relatedContributionIds: contribution.relatedContributionIds
      }
    };

    // Store on Filecoin
    const cid = await this.filecoinClient.storeContent(contentPackage);
    console.log(`Stored contribution on Filecoin with CID: ${cid}`);

    return cid;
  }

  /**
   * Cache evaluation result for future reference
   * @param contributionId The contribution ID
   * @param evaluationResult The evaluation result
   */
  private async cacheEvaluationResult(
    contributionId: string,
    evaluationResult: AggregatedEvaluation
  ): Promise<void> {
    console.log(`Caching evaluation result for contribution: ${contributionId}`);

    try {
      const EvaluationResultCache = getEvaluationResultCacheModel();

      // Store individual model evaluations
      for (const result of evaluationResult.modelResults) {
        await EvaluationResultCache.create({
          contributionId,
          modelId: result.modelId,
          criteria: result.criteria,
          score: result.score,
          feedback: result.feedback,
          timestamp: new Date(),
          version: result.version
        });
      }

      console.log(`Successfully cached evaluation results for contribution: ${contributionId}`);
    } catch (error) {
      console.error(`Error caching evaluation result for contribution ${contributionId}:`, error);
      // Non-critical error, just log it
    }
  }

  /**
   * Process pending contributions in batches
   * @param batchSize Maximum number of contributions to process in this batch
   * @returns Object with process statistics
   */
  public async processPendingContributions(batchSize: number = 5): Promise<{
    processed: number;
    approved: number;
    rejected: number;
    errors: number;
  }> {
    this.validateInitialized();

    console.log(`Processing pending contributions (batch size: ${batchSize})`);

    let approved = 0;
    let rejected = 0;
    let errors = 0;

    try {
      // Get pending contributions from MongoDB
      const ContributionDraft = getContributionDraftModel();
      const pendingContributions = await ContributionDraft.find({
        status: 'pending'
      }).limit(batchSize);

      console.log(`Found ${pendingContributions.length} pending contributions`);

      // Process each contribution
      const processingResults = await Promise.allSettled(
        pendingContributions.map(contribution => {
          // Explicitly cast the document to IContributionDraft type
          const typedContribution = contribution as IContributionDraft;
          const contributionId = typedContribution._id.toString();

          return this.processContribution(contributionId)
            .then(() => {
              // Check final status after processing
              return ContributionDraft.findById(contributionId);
            });
        })
      );

      // Count results
      for (const result of processingResults) {
        if (result.status === 'fulfilled') {
          const processedContribution = result.value;
          if (processedContribution) {
            if (processedContribution.status === 'approved') {
              approved++;
            } else if (processedContribution.status === 'rejected') {
              rejected++;
            }
          }
        } else {
          errors++;
        }
      }

      console.log(`Completed batch processing of ${pendingContributions.length} contributions`);
      console.log(`Approved: ${approved}, Rejected: ${rejected}, Errors: ${errors}`);

      return {
        processed: pendingContributions.length,
        approved,
        rejected,
        errors
      };
    } catch (error) {
      console.error('Error processing pending contributions:', error);
      throw error;
    }
  }
} 
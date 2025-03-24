/**
 * AI evaluator class for ABSTRACTU
 * Assesses contributions using foundation models
 */
import axios from 'axios';

/**
 * Types for the foundation model and evaluation
 */
export interface FoundationModel {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  weight: number;
  version: string;
}

export type EvaluationCriteria = 'novelty' | 'usefulness' | 'coherence' | 'overall';

export interface EvaluationResult {
  modelId: string;
  modelName: string;
  criteria: EvaluationCriteria;
  score: number;
  feedback: string;
  version: string;
}

export interface AggregatedEvaluation {
  overallScore: number;
  criteriaScores: Record<EvaluationCriteria, number>;
  feedback: string;
  modelResults: EvaluationResult[];
}

/**
 * AI Evaluator class
 */
export class AIEvaluator {
  private static instance: AIEvaluator;
  private models: FoundationModel[] = [];
  private initialized = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Configuration will be loaded during initialization
  }

  /**
   * Get singleton instance of AI Evaluator
   */
  public static getInstance(): AIEvaluator {
    if (!AIEvaluator.instance) {
      AIEvaluator.instance = new AIEvaluator();
    }
    return AIEvaluator.instance;
  }

  /**
   * Initialize the AI Evaluator with foundation models
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Load foundation models from environment variables
    try {
      const modelsConfig = this.loadModelsFromEnvironment();

      if (modelsConfig.length === 0) {
        console.warn('No foundation models configured. Evaluation will use simulated results.');
      }

      this.models = modelsConfig;
      this.initialized = true;
      console.log(`AI Evaluator initialized with ${this.models.length} models`);
    } catch (error) {
      console.error('AI Evaluator initialization error:', error);
      throw error;
    }
  }

  /**
   * Load foundation models from environment variables
   */
  private loadModelsFromEnvironment(): FoundationModel[] {
    const models: FoundationModel[] = [];

    // Check for FOUNDATION_MODELS env var which contains a comma-separated list of model IDs
    const modelIds = process.env.FOUNDATION_MODELS?.split(',') || [];

    for (const modelId of modelIds) {
      const id = modelId.trim();
      if (!id) continue;

      // For each model, look for its specific config
      const name = process.env[`MODEL_${id}_NAME`] || id;
      const apiEndpoint = process.env[`MODEL_${id}_ENDPOINT`] || '';
      const apiKey = process.env[`MODEL_${id}_API_KEY`] || '';
      const weight = Number(process.env[`MODEL_${id}_WEIGHT`] || '1');
      const version = process.env[`MODEL_${id}_VERSION`] || '1.0';

      if (apiEndpoint && apiKey) {
        models.push({
          id,
          name,
          apiEndpoint,
          apiKey,
          weight,
          version
        });
      }
    }

    return models;
  }

  /**
   * Evaluate a contribution with all active foundation models
   * @param contribution The contribution to evaluate
   * @returns Promise resolving to the aggregated evaluation results
   */
  public async evaluateContribution(contribution: {
    title: string;
    description: string;
    content: string;
  }): Promise<AggregatedEvaluation> {
    if (!this.initialized) {
      await this.initialize();
    }

    // If no models are configured, use simulated evaluation
    if (this.models.length === 0) {
      return this.simulateEvaluation(contribution);
    }

    try {
      // Evaluate with each foundation model
      const criteriaList: EvaluationCriteria[] = ['novelty', 'usefulness', 'coherence', 'overall'];
      const evaluationPromises: Promise<EvaluationResult[]>[] = [];

      // For each model, evaluate all criteria
      for (const model of this.models) {
        const modelPromises = criteriaList.map(criteria =>
          this.evaluateWithModel(model, criteria, contribution)
        );

        evaluationPromises.push(Promise.all(modelPromises));
      }

      // Wait for all evaluations to complete
      const modelResults = (await Promise.all(evaluationPromises)).flat();

      // Aggregate the results
      return this.aggregateResults(modelResults);
    } catch (error) {
      console.error('Evaluation error:', error);
      throw new Error(`Failed to evaluate contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate a contribution with a specific model and criteria
   * @param model The foundation model to use
   * @param criteria The evaluation criteria
   * @param contribution The contribution to evaluate
   * @returns Promise resolving to the evaluation result
   */
  private async evaluateWithModel(
    model: FoundationModel,
    criteria: EvaluationCriteria,
    contribution: { title: string; description: string; content: string }
  ): Promise<EvaluationResult> {
    try {
      // Prepare the prompt based on the criteria
      const prompt = this.preparePrompt(criteria, contribution);

      // Call the model API
      const response = await axios.post(
        model.apiEndpoint,
        {
          prompt,
          max_tokens: 150,
          temperature: 0.2
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${model.apiKey}`
          }
        }
      );

      // Parse the response
      const result = this.parseModelResponse(response.data, criteria);

      return {
        modelId: model.id,
        modelName: model.name,
        criteria,
        score: result.score,
        feedback: result.feedback,
        version: model.version
      };
    } catch (error) {
      console.error(`Evaluation error with model ${model.id} for ${criteria}:`, error);

      // Return a fallback result on error
      return {
        modelId: model.id,
        modelName: model.name,
        criteria,
        score: 50, // Neutral score on error
        feedback: `Error evaluating with ${model.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        version: model.version
      };
    }
  }

  /**
   * Prepare a prompt for the foundation model based on evaluation criteria
   */
  private preparePrompt(criteria: EvaluationCriteria, contribution: {
    title: string;
    description: string;
    content: string;
  }): string {
    const { title, description, content } = contribution;

    const criteriaDescriptions = {
      novelty: 'How original and innovative is this contribution? Does it present new ideas or approaches?',
      usefulness: 'How useful is this contribution? Does it solve problems or provide value to readers?',
      coherence: 'How well-structured and coherent is this contribution? Is it clearly written and logically organized?',
      overall: 'What is the overall quality of this contribution considering novelty, usefulness, and coherence?'
    };

    return `
Evaluate the following contribution for ${criteria}:
${criteriaDescriptions[criteria]}

Title: ${title}
Description: ${description}
Content:
${content}

Provide your evaluation in the following format:
Score: [0-100]
Feedback: [Your detailed feedback]
    `.trim();
  }

  /**
   * Parse the response from a foundation model
   * @param response The raw response data from the model API
   * @param criteria The evaluation criteria used
   * @returns Object containing score and feedback
   */
  private parseModelResponse(
    response: Record<string, unknown>,
    criteria: EvaluationCriteria
  ): { score: number; feedback: string } {
    try {
      // Default values if parsing fails
      let score = 50;
      let feedback = `No feedback available for ${criteria} evaluation.`;

      // Extract score and feedback from response if available
      if (typeof response === 'object' && response !== null) {
        if ('score' in response && typeof response.score === 'number') {
          score = response.score;
        }

        if ('feedback' in response && typeof response.feedback === 'string') {
          feedback = response.feedback;
        }
      }

      // Normalize score to 0-100 range
      score = Math.min(100, Math.max(0, score));

      return { score, feedback };
    } catch (error) {
      console.warn(`Error parsing model response for ${criteria}:`, error);
      return {
        score: 50,
        feedback: `Could not parse evaluation for ${criteria}.`
      };
    }
  }

  /**
   * Aggregate results from multiple foundation models
   */
  private aggregateResults(results: EvaluationResult[]): AggregatedEvaluation {
    // Initialize scores for each criteria
    const criteriaScores: Record<EvaluationCriteria, { total: number; weight: number }> = {
      novelty: { total: 0, weight: 0 },
      usefulness: { total: 0, weight: 0 },
      coherence: { total: 0, weight: 0 },
      overall: { total: 0, weight: 0 }
    };

    // Calculate weighted scores for each criteria
    for (const result of results) {
      const model = this.models.find(m => m.id === result.modelId);
      const weight = model?.weight || 1;

      criteriaScores[result.criteria].total += result.score * weight;
      criteriaScores[result.criteria].weight += weight;
    }

    // Calculate final scores
    const finalScores: Record<EvaluationCriteria, number> = {
      novelty: Math.round(criteriaScores.novelty.total / (criteriaScores.novelty.weight || 1)),
      usefulness: Math.round(criteriaScores.usefulness.total / (criteriaScores.usefulness.weight || 1)),
      coherence: Math.round(criteriaScores.coherence.total / (criteriaScores.coherence.weight || 1)),
      overall: Math.round(criteriaScores.overall.total / (criteriaScores.overall.weight || 1))
    };

    // If no direct overall score, calculate from other criteria
    if (finalScores.overall === 0 && results.some(r => r.criteria !== 'overall')) {
      finalScores.overall = Math.round(
        (finalScores.novelty * 0.3) +
        (finalScores.usefulness * 0.4) +
        (finalScores.coherence * 0.3)
      );
    }

    // Generate aggregate feedback
    const overallFeedback = this.generateAggregateFeedback(results, finalScores);

    return {
      overallScore: finalScores.overall,
      criteriaScores: finalScores,
      feedback: overallFeedback,
      modelResults: results
    };
  }

  /**
   * Generate aggregate feedback from individual model evaluations
   */
  private generateAggregateFeedback(
    results: EvaluationResult[],
    scores: Record<EvaluationCriteria, number>
  ): string {
    // Get overall evaluations
    const overallEvaluations = results.filter(r => r.criteria === 'overall');

    // If we have overall evaluations, use the one from the highest-weighted model
    if (overallEvaluations.length > 0) {
      const highestWeightedEval = overallEvaluations.reduce((prev, current) => {
        const prevModel = this.models.find(m => m.id === prev.modelId);
        const currentModel = this.models.find(m => m.id === current.modelId);
        return (prevModel?.weight || 0) > (currentModel?.weight || 0) ? prev : current;
      });

      return highestWeightedEval.feedback;
    }

    // Otherwise, generate a summary based on the criteria scores
    return `
This contribution received the following scores:
- Novelty: ${scores.novelty}/100
- Usefulness: ${scores.usefulness}/100
- Coherence: ${scores.coherence}/100
- Overall: ${scores.overall}/100

${this.generateScoreFeedback(scores.overall)}
    `.trim();
  }

  /**
   * Generate feedback based on the overall score
   */
  private generateScoreFeedback(score: number): string {
    if (score >= 90) {
      return 'Exceptional contribution that demonstrates significant originality, usefulness, and clarity.';
    } else if (score >= 80) {
      return 'Excellent contribution with strong qualities across all evaluation criteria.';
    } else if (score >= 70) {
      return 'Very good contribution with notable strengths and minor areas for improvement.';
    } else if (score >= 60) {
      return 'Good contribution with solid foundations and some areas that could be enhanced.';
    } else if (score >= 50) {
      return 'Satisfactory contribution that meets basic standards but has room for improvement.';
    } else if (score >= 40) {
      return 'Below average contribution that requires substantial revisions in multiple areas.';
    } else if (score >= 30) {
      return 'Poor contribution with significant issues in quality, originality, or usefulness.';
    } else {
      return 'Insufficient contribution that does not meet the minimum standards for acceptance.';
    }
  }

  /**
   * Simulate an evaluation when no foundation models are available
   * This is used for development and testing purposes
   */
  private simulateEvaluation(contribution: {
    title: string;
    description: string;
    content: string;
  }): AggregatedEvaluation {
    console.warn('Using simulated evaluation');

    // Create simulated results based on content length and complexity
    const titleLength = contribution.title.length;
    const contentLength = contribution.content.length;
    const wordCount = contribution.content.split(/\s+/).length;

    // Simple heuristics for simulated scoring
    const baseScore = 60 + Math.min(20, Math.floor(contentLength / 1000) * 5);
    const titleBonus = Math.min(5, titleLength / 10);
    const contentPenalty = wordCount < 100 ? -10 : 0;

    // Generate scores with some randomness
    const getScore = (base: number) => Math.min(100, Math.max(0,
      base + titleBonus + contentPenalty + (Math.random() * 10 - 5)
    ));

    const scores: Record<EvaluationCriteria, number> = {
      novelty: Math.round(getScore(baseScore - 5)),
      usefulness: Math.round(getScore(baseScore)),
      coherence: Math.round(getScore(baseScore + 5)),
      overall: Math.round(getScore(baseScore))
    };

    // Simulate model results
    const modelResults: EvaluationResult[] = [
      {
        modelId: 'sim-model',
        modelName: 'Simulation Model',
        criteria: 'novelty',
        score: scores.novelty,
        feedback: `The contribution has a ${this.getScoreCategory(scores.novelty)} level of novelty.`,
        version: '1.0'
      },
      {
        modelId: 'sim-model',
        modelName: 'Simulation Model',
        criteria: 'usefulness',
        score: scores.usefulness,
        feedback: `The contribution has a ${this.getScoreCategory(scores.usefulness)} level of usefulness.`,
        version: '1.0'
      },
      {
        modelId: 'sim-model',
        modelName: 'Simulation Model',
        criteria: 'coherence',
        score: scores.coherence,
        feedback: `The contribution has a ${this.getScoreCategory(scores.coherence)} level of coherence.`,
        version: '1.0'
      },
      {
        modelId: 'sim-model',
        modelName: 'Simulation Model',
        criteria: 'overall',
        score: scores.overall,
        feedback: this.generateScoreFeedback(scores.overall),
        version: '1.0'
      }
    ];

    return {
      overallScore: scores.overall,
      criteriaScores: scores,
      feedback: this.generateScoreFeedback(scores.overall),
      modelResults
    };
  }

  /**
   * Get a descriptive category for a score
   */
  private getScoreCategory(score: number): string {
    if (score >= 90) return 'exceptional';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'very good';
    if (score >= 60) return 'good';
    if (score >= 50) return 'satisfactory';
    if (score >= 40) return 'below average';
    if (score >= 30) return 'poor';
    return 'insufficient';
  }
} 
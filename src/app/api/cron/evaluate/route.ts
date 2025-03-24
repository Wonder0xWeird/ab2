/**
 * ACRONTU Evaluation Cron Job API Route
 * 
 * This route is triggered by Vercel's cron scheduler to process pending contributions.
 * It is protected by an authorization token to prevent unauthorized access.
 * 
 * Cron Schedule: Every 10 minutes (uses "0,10,20,30,40,50 * * * *" in crontab format)
 * In production, this schedule can be adjusted based on volume and cost considerations.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ACRONTUEvaluationService } from '@/utils/acrontu/evaluationService';
import { MongoDBClient } from '@/utils/mongodb';

/**
 * Validates the authorization token
 * @param request Request object
 * @returns Boolean indicating if the request is authorized
 */
function validateAuth(request: NextRequest): boolean {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Get the token
  const token = authHeader.split(' ')[1];

  // Compare with the expected token
  const expectedToken = process.env.CRON_SECRET;
  if (!expectedToken) {
    console.error('CRON_SECRET environment variable is not set');
    return false;
  }

  return token === expectedToken;
}

/**
 * GET /api/cron/evaluate
 * Cron job to evaluate pending contributions
 */
export async function GET(request: NextRequest) {
  console.log('Starting ACRONTU contribution evaluation cron job');

  // Validate authorization
  if (!validateAuth(request)) {
    console.error('Unauthorized cron job request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB');
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Initialize the evaluation service
    console.log('Initializing evaluation service');
    const evaluationService = ACRONTUEvaluationService.getInstance();
    await evaluationService.initialize();

    // Get batch size from query parameters or use default
    const { searchParams } = new URL(request.url);
    const batchSizeParam = searchParams.get('batchSize');
    const batchSize = batchSizeParam ? parseInt(batchSizeParam, 10) : 5;

    // Process pending contributions
    console.log(`Processing up to ${batchSize} pending contributions`);
    const result = await evaluationService.processPendingContributions(batchSize);

    return NextResponse.json({
      message: 'ACRONTU evaluation completed successfully',
      processed: result.processed,
      approved: result.approved,
      rejected: result.rejected,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in ACRONTU evaluation cron job:', error);
    return NextResponse.json(
      {
        error: 'Failed to process contributions',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 
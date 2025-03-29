import { NextRequest, NextResponse } from 'next/server';
import { MongoDBClient, ContributionDraft } from '@/utils/mongodb';
import { BlockchainClient } from '@/utils/blockchain';
import { authMiddleware } from '@/utils/auth/middleware';

/**
 * POST /api/contributions/[id]/submit
 * Submit a draft contribution for evaluation
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  // Handle params as potentially being a Promise in Next.js 15
  const params = await (context.params instanceof Promise
    ? context.params
    : Promise.resolve(context.params));

  const { id } = params;

  // Get user from auth
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Get contribution
    const contribution = await ContributionDraft.findById(id);

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Verify ownership
    if (contribution.contributorAddress !== user.address) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify it's still in draft status
    if (contribution.status !== 'draft') {
      return NextResponse.json(
        { error: 'Contribution has already been submitted or processed' },
        { status: 400 }
      );
    }

    // Initialize blockchain client
    const blockchainClient = BlockchainClient.getInstance();
    await blockchainClient.initialize();

    // Register contribution intent on blockchain
    const contributionId = await blockchainClient.registerContributionIntent(
      contribution.title,
      contribution.description,
      user.address
    );

    // Update the contribution status to pending
    const updatedContribution = await ContributionDraft.findByIdAndUpdate(
      id,
      {
        status: 'pending',
        blockchainId: contributionId,
        updatedAt: new Date(),
        submittedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Contribution submitted for evaluation',
      contribution: updatedContribution,
      blockchainId: contributionId
    });
  } catch (error) {
    console.error('Error submitting contribution:', error);
    return NextResponse.json(
      { error: 'Failed to submit contribution' },
      { status: 500 }
    );
  }
} 
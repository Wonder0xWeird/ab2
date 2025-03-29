import { NextRequest, NextResponse } from 'next/server';
import { MongoDBClient, ContributionDraft } from '@/utils/mongodb';
import { authMiddleware } from '@/utils/auth/middleware';

/**
 * GET /api/contributions/related
 * Find related contributions by parent, children or explicitly related
 */
export async function GET(request: NextRequest) {
  // Get user from auth
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const contributionId = searchParams.get('id');

  if (!contributionId) {
    return NextResponse.json(
      { error: 'Contribution ID is required' },
      { status: 400 }
    );
  }

  try {
    // Connect to MongoDB
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Get contribution
    const contribution = await ContributionDraft.findById(contributionId);

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Get related contributions
    const relatedContributions = {
      // Get parent contribution
      parent: contribution.parentContributionId ?
        await ContributionDraft.findById(contribution.parentContributionId) : null,

      // Get child contributions
      children: await ContributionDraft.find({
        parentContributionId: contributionId,
        $or: [
          { status: 'approved' },
          { contributorAddress: user.address }
        ]
      }),

      // Get explicitly related contributions
      related: contribution.relatedContributionIds?.length ?
        await ContributionDraft.find({
          _id: { $in: contribution.relatedContributionIds },
          $or: [
            { status: 'approved' },
            { contributorAddress: user.address }
          ]
        }) : []
    };

    return NextResponse.json({
      contributionId,
      relatedContributions
    });
  } catch (error) {
    console.error('Error fetching related contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related contributions' },
      { status: 500 }
    );
  }
} 
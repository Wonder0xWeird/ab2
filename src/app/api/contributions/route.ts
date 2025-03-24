import { NextRequest, NextResponse } from 'next/server';
import { MongoDBClient, getContributionDraftModel } from '@/utils/mongodb';
import { authMiddleware } from '@/utils/auth/middleware';

/**
 * GET /api/contributions
 * List all contributions for the current user
 */
export async function GET(request: NextRequest) {
  // Get user from auth
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Query for contributions
    const ContributionDraft = getContributionDraftModel();
    const contributions = await ContributionDraft.find({
      contributorAddress: user.address
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      total: contributions.length,
      contributions
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contributions
 * Create a new draft contribution
 */
export async function POST(request: NextRequest) {
  // Get user from auth
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      title,
      description,
      content,
      parentContributionId,
      relatedContributionIds
    } = await request.json();

    // Validate required fields
    if (!title || !description || !content) {
      return NextResponse.json({
        error: 'Title, description, and content are required'
      }, { status: 400 });
    }

    // Connect to MongoDB
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Create contribution draft
    const ContributionDraft = getContributionDraftModel();
    const newContribution = new ContributionDraft({
      contributorAddress: user.address,
      title,
      description,
      content,
      status: 'draft',
      evaluationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentContributionId,
      relatedContributionIds
    });

    await newContribution.save();

    return NextResponse.json({
      message: 'Draft contribution created',
      contribution: newContribution
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
} 
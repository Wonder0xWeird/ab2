import { NextRequest, NextResponse } from 'next/server';
import { MongoDBClient, ContributionDraft } from '@/utils/mongodb';
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

    // Get all contributions the user has access to
    const contributions = await ContributionDraft.find({
      $or: [
        { contributorAddress: user.address }, // User's own contributions
        { status: 'approved' } // Approved contributions (anyone can see)
      ]
    }).sort({ updatedAt: -1 }); // Sort by most recently updated

    return NextResponse.json(contributions);
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
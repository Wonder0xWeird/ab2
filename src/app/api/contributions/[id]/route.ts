import { NextRequest, NextResponse } from 'next/server';
import { MongoDBClient, ContributionDraft } from '@/utils/mongodb';
import { authMiddleware } from '@/utils/auth/middleware';

/**
 * GET handler for /api/contributions/[id]
 * Get a specific contribution
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get params from the Promise
  const params = await context.params;
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

    // Check if user has access (either their own or it's approved)
    if (contribution.contributorAddress !== user.address && contribution.status !== 'approved') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contribution' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for /api/contributions/[id]
 * Update a draft contribution
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Get params from the Promise
  const params = await context.params;
  const { id } = params;

  // Get user from auth
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, content } = await request.json();

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
        { error: 'Cannot update contribution that is not in draft status' },
        { status: 400 }
      );
    }

    // Update the contribution
    const updatedContribution = await ContributionDraft.findByIdAndUpdate(
      id,
      {
        title: title || contribution.title,
        description: description || contribution.description,
        content: content || contribution.content,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Draft contribution updated successfully',
      contribution: updatedContribution
    });
  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to update contribution' },
      { status: 500 }
    );
  }
} 
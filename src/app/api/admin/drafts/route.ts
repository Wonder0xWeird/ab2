import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth/authOptions';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Draft } from '@/utils/mongodb/models';
import { DraftType } from '@/utils/mongodb/schemas/draft.schema';

// Helper function for authorization
async function authorizeAdmin(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'superadmin') {
    return { authorized: false, session: null };
  }
  return { authorized: true, session };
}

// GET: Fetch draft for a specific concept by the logged-in admin
export async function GET(request: Request) {
  const { authorized, session } = await authorizeAdmin(request);
  if (!authorized || !session?.user?.address) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cid = searchParams.get('cid');

  if (!cid || !/^[a-z]$/.test(cid)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing concept ID (cid)' }, { status: 400 });
  }

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    const draft = await Draft.findOne({
      cid: cid,
      authorAddress: session.user.address.toLowerCase(), // Match logged-in admin
      type: DraftType.Concept // Ensure it's a concept draft
    }).lean();

    if (!draft) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });

  } catch (error: any) {
    console.error(`Error fetching draft for concept ${cid}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch draft", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create or update a concept draft for the logged-in admin
export async function POST(request: Request) {
  const { authorized, session } = await authorizeAdmin(request);
  if (!authorized || !session?.user?.address) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { cid, content } = body;

  if (!cid || !/^[a-z]$/.test(cid)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing concept ID (cid)' }, { status: 400 });
  }
  if (typeof content !== 'string') { // Allow empty string for content
    return NextResponse.json({ success: false, error: 'Missing or invalid content' }, { status: 400 });
  }

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    const updateData = {
      cid: cid,
      authorAddress: session.user.address.toLowerCase(),
      type: DraftType.Concept,
      content: content,
      updatedAt: new Date(),
    };

    // Use findOneAndUpdate with upsert:true to create or update
    const updatedDraft = await Draft.findOneAndUpdate(
      {
        cid: cid,
        authorAddress: session.user.address.toLowerCase(),
        type: DraftType.Concept
      },
      { $set: updateData, $setOnInsert: { createdAt: new Date() } },
      { new: true, upsert: true, lean: true }
    );

    if (!updatedDraft) {
      // Should not happen with upsert: true, but handle defensively
      throw new Error('Draft operation failed unexpectedly.');
    }

    return NextResponse.json({ success: true, draft: updatedDraft });

  } catch (error: any) {
    console.error(`Error saving draft for concept ${cid}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to save draft", details: error.message },
      { status: 500 }
    );
  }
} 
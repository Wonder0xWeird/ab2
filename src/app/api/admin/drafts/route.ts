import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth/authOptions';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Draft, UserRole } from '@/utils/mongodb/models';

// Define allowed draft types and statuses if not already imported
type DraftType = 'concept' | 'thread'; // Example, adjust if needed
type DraftStatus = 'draft' | 'published'; // Example, adjust if needed

// POST handler for creating a new draft
export async function POST(request: Request) {
  console.log("POST /api/admin/drafts called");
  const session = await getServerSession(authOptions);

  // 1. Check authentication
  if (!session?.user?.address) {
    console.error('Auth Error: No session or user address found');
    return NextResponse.json({ success: false, error: 'Unauthorized: Not signed in' }, { status: 401 });
  }

  // 2. Check role (only superadmin can create CONCEPT drafts)
  // Note: Regular users might create THREAD drafts via a different endpoint later
  // For now, this endpoint assumes concept draft creation by superadmin
  if (session.user.role !== UserRole.SUPERADMIN) {
    console.error(`Auth Error: User ${session.user.address} with role ${session.user.role} attempted to create concept draft.`);
    return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();
    const { cid, type, content }: { cid: string; type: DraftType; content: string } = await request.json();

    // 3. Validate input
    if (!cid || !type || typeof content !== 'string') {
      console.error('Validation Error: Missing or invalid fields', { cid, type, content: typeof content });
      return NextResponse.json({ success: false, error: 'Missing or invalid fields (cid, type, content required)' }, { status: 400 });
    }

    if (type !== 'concept') {
      // Currently only supporting concept drafts here
      console.error(`Validation Error: Invalid draft type '${type}' submitted.`);
      return NextResponse.json({ success: false, error: `Invalid draft type '${type}'. Only 'concept' allowed here.` }, { status: 400 });
    }

    console.log(`Creating new concept draft for Concept [${cid}] by ${session.user.address}...`);

    // 4. Create Draft document using an explicit type definition
    const newDraftData: {
      cid: string;
      type: DraftType;
      content: string;
      authorAddress: string;
      status: DraftStatus;
      // publishedAt?: Date; // Optionally include if needed before save
    } = {
      cid,
      type, // Ensured type is validated above
      content,
      authorAddress: session.user.address.toLowerCase(),
      status: 'draft', // Explicitly include status
    };

    const newDraft = new Draft(newDraftData);
    const savedDraft = await newDraft.save();

    console.log(`Draft created successfully with ID: ${savedDraft._id}`);
    return NextResponse.json({ success: true, draft: savedDraft }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error in POST /api/admin/drafts:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// GET handler for retrieving drafts (e.g., for a specific concept or user)
export async function GET(/* request: Request */) {
  console.log("GET /api/admin/drafts called");
  const session = await getServerSession(authOptions);

  // 1. Check authentication
  if (!session?.user?.address) {
    console.error('Auth Error: No session or user address found for GET');
    return NextResponse.json({ success: false, error: 'Unauthorized: Not signed in' }, { status: 401 });
  }

  // 2. Check role - For now, only superadmin can list all concept drafts
  if (session.user.role !== UserRole.SUPERADMIN) {
    console.error(`Auth Error: User ${session.user.address} with role ${session.user.role} attempted GET drafts.`);
    return NextResponse.json({ success: false, error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Example: Fetch all concept drafts (could add filters based on query params later)
    // const { searchParams } = new URL(request.url); 
    // const cidFilter = searchParams.get('cid');

    console.log("Fetching all concept drafts for superadmin...");
    const drafts = await Draft.find({ type: 'concept' }).sort({ updatedAt: -1 }); // Find only concept type

    console.log(`Found ${drafts.length} concept drafts.`);
    return NextResponse.json({ success: true, drafts: drafts }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error in GET /api/admin/drafts:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 
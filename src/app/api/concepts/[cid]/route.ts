import { NextResponse } from 'next/server';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Concept } from '@/utils/mongodb/models';

// Define params type for clarity
interface RouteParams {
  params: Promise<{ cid: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { cid } = await params;

  // Validate CID format (single lowercase letter)
  if (!cid || !/^[a-z]$/.test(cid)) {
    return NextResponse.json({ success: false, error: 'Invalid Concept ID format' }, { status: 400 });
  }

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Fetch the specific concept by CID
    const concept = await Concept.findOne({ cid }).lean();

    if (!concept) {
      return NextResponse.json({ success: false, error: 'Concept not found' }, { status: 404 });
    }

    // Return the found concept data
    return NextResponse.json({ success: true, concept });

  } catch (error: any) {
    console.error(`Error fetching concept data for CID [${cid}]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch concept data", details: error.message },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Concept } from '@/utils/mongodb/models';

export async function GET() {
  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Fetch all concepts, selecting only cid and title
    // Sort by cid for consistent ordering in the dropdown
    const concepts = await Concept.find({}, 'cid title')
      .sort({ cid: 1 })
      .lean();

    return NextResponse.json({ success: true, concepts });

  } catch (error: any) {
    console.error("Error fetching concepts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch concepts", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS handler if needed for CORS, though likely not necessary for same-origin requests
// export async function OPTIONS(request: Request) {
//   return new NextResponse(null, { status: 204 });
// }

// POST handler for creating a new concept
// Remove unused request parameter
export async function POST(/* request: Request */) {
  // Comment out placeholder implementation
  /*
  // const { cid, title, description, tags, initialContent } = await request.json(); 
  // ... actual implementation would go here ...
  */
  console.warn("POST /api/concepts not fully implemented yet.");
  return NextResponse.json({ success: false, error: "Not Implemented" }, { status: 501 });
} 
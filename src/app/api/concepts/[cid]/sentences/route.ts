import { NextResponse } from 'next/server';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Sentence, ISentence, Concept } from '@/utils/mongodb/models';

// Define the expected parameters in the URL context
interface SentencesContext {
  params: Promise<{
    cid: string;
  }>
}

const DEFAULT_LIMIT = 20; // Number of sentences per page

export async function GET(request: Request, context: SentencesContext) {
  const awaitedParams = await context.params; // Await the promise
  const { cid } = awaitedParams; // Destructure from the resolved value
  const { searchParams } = new URL(request.url);

  // Validate Concept ID format (single lowercase letter)
  if (!cid || !/^[a-z]$/.test(cid)) {
    return NextResponse.json({ success: false, error: 'Invalid Concept ID format.' }, { status: 400 });
  }

  // Get pagination parameters
  const startSidParam = searchParams.get('startSid');
  const limitParam = searchParams.get('limit');

  let startSid = 0;
  if (startSidParam) {
    const parsedSid = parseInt(startSidParam, 10);
    if (!isNaN(parsedSid) && parsedSid >= 0) {
      startSid = parsedSid;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid startSid parameter.' }, { status: 400 });
    }
  }

  let limit = DEFAULT_LIMIT;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    // Add a reasonable max limit (e.g., 100)
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      limit = parsedLimit;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid limit parameter (must be 1-100).' }, { status: 400 });
    }
  }

  console.log(`Fetching sentences for cid: ${cid}, startSid: ${startSid}, limit: ${limit}`);

  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Optional: Check if concept actually exists first
    const conceptExists = await Concept.exists({ cid });
    if (!conceptExists) {
      return NextResponse.json({ success: false, error: 'Concept not found' }, { status: 404 });
    }

    // Query sentences with pagination
    const sentences: ISentence[] = await Sentence.find({
      cid: cid,
      sid: { $gte: startSid } // Start from or after startSid
    })
      .sort({ sid: 1 }) // Ensure correct order
      .limit(limit)       // Apply limit
      .lean();            // Get plain objects

    // Determine nextSid for infinite scroll
    let nextSid: number | null = null;
    if (sentences.length === limit) {
      // If we fetched the max limit, there might be more.
      // The nextSid will be the sid of the last fetched item + 1.
      const lastSentence = sentences[sentences.length - 1];
      if (lastSentence) {
        nextSid = lastSentence.sid + 1;
      }
    }

    console.log(`Found ${sentences.length} sentences. nextSid: ${nextSid}`);

    return NextResponse.json({
      success: true,
      sentences,
      nextSid,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching sentences for cid [${cid}]:`, error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 
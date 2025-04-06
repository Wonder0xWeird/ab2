import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth/authOptions';
import { MongoDBClient } from '@/utils/mongodb/client';
import { Draft, Sentence, ISentence } from '@/utils/mongodb/models';
import { DraftType } from '@/utils/mongodb/schemas/draft.schema';
// Import the markdown parsing utility
import { parseMarkdownToSentences, ParsedSentence } from '@/utils/parsing/markdownParser';

// Helper function for authorization
async function authorizeAdmin(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'superadmin') {
    return { authorized: false, session: null };
  }
  return { authorized: true, session };
}

// POST: Publish a specific draft by ID
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

  const { draftId } = body;

  if (!draftId || typeof draftId !== 'string') {
    return NextResponse.json({ success: false, error: 'Invalid or missing draft ID' }, { status: 400 });
  }

  const mongoClient = MongoDBClient.getInstance();
  // Ensure connection before starting session
  await mongoClient.connect();
  const mongooseInstance = mongoClient.getConnection();
  // Access the native client from the mongoose connection to start a session
  const dbSession = await mongooseInstance.connection.startSession();

  try {
    let sentencesAdded = 0;
    await dbSession.withTransaction(async () => {
      const draft = await Draft.findOneAndDelete(
        {
          _id: draftId,
          authorAddress: session.user.address.toLowerCase(), // Ensure admin owns the draft
          type: DraftType.Concept
        },
        { session: dbSession }
      ).lean();

      if (!draft) {
        // No draft found or didn't belong to user - end transaction
        throw new Error('Draft not found or not authorized to publish');
      }

      const { cid, content } = draft;

      // --- Start Parsing and Sentence Creation --- 

      // Ensure cid is valid before proceeding
      if (!cid || typeof cid !== 'string') {
        throw new Error('Invalid concept ID associated with the draft.');
      }

      // 1. Find the highest existing sentence ID (sid) for this concept
      const lastSentence = await Sentence.findOne({ cid })
        .sort({ sid: -1 })
        .select('sid')
        .session(dbSession)
        .lean();
      let nextSid = lastSentence ? lastSentence.sid + 1 : 0;
      const originalNextSid = nextSid; // Keep track of the starting SID for this batch

      // 2. Parse the markdown content into Sentence objects using the utility
      const parsedSentences: ParsedSentence[] = parseMarkdownToSentences(content, cid);

      // 3. Re-assign sequential `sid` based on `nextSid` and link psid/nsid
      const sentencesToSave: ISentence[] = parsedSentences.map((parsedSentence, index) => ({
        ...parsedSentence,
        sid: originalNextSid + index, // Assign sequential SID for this batch
        psid: index === 0
          ? (lastSentence ? lastSentence.sid : undefined) // Link to previous sentence if exists
          : originalNextSid + index - 1, // Link to previous in this batch
        nsid: index < parsedSentences.length - 1
          ? originalNextSid + index + 1 // Link to next in this batch
          : undefined, // Last sentence has no next initially
        // Ensure publishedAt is consistent if needed, or keep from parser
        publishedAt: parsedSentence.publishedAt || new Date(),
      })) as ISentence[]; // Assert type after adding missing fields

      // 4. Save the new sentences if any were generated
      if (sentencesToSave.length > 0) {
        // Link the actual last sentence in DB (if exists) to the first new one
        if (lastSentence) {
          await Sentence.updateOne(
            { _id: lastSentence._id }, // Use _id for reliability
            { $set: { nsid: sentencesToSave[0].sid } },
            { session: dbSession }
          );
        }

        // Insert the new sentences (linking within the batch is already done)
        await Sentence.insertMany(sentencesToSave, { session: dbSession });
        console.log(`Successfully added ${sentencesToSave.length} sentences for concept ${cid} from draft ${draftId}`);
        sentencesAdded = sentencesToSave.length;
      } else {
        console.log(`No sentences generated from draft ${draftId} for concept ${cid}. Draft deleted.`);
      }
      // --- End Parsing and Sentence Creation --- 
    });

    return NextResponse.json({ success: true, message: 'Draft published successfully', sentencesAdded });

  } catch (error: any) {
    console.error(`Error publishing draft ${draftId}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to publish draft", details: error.message },
      { status: 500 }
    );
  } finally {
    await dbSession.endSession();
  }
} 
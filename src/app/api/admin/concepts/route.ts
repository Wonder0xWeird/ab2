import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/utils/auth/authOptions';
import { MongoDBClient } from '@/utils/mongodb/client';
import {
  Concept, IConcept,
  Sentence, ISentence,
  UserRole
} from '@/utils/mongodb/models';
import mongoose, { ClientSession, Document } from 'mongoose';
import { parseMarkdownToSentences, ParsedSentence } from '@/utils/parsing/markdownParser';

// Type alias for Mongoose Document incorporating our interface
type IConceptDocument = IConcept & Document;

export async function POST(request: Request) {
  console.log('POST /api/admin/concepts called');
  const session = await getServerSession(authOptions);
  console.log('Session:', session);

  if (!session || session.user?.role !== UserRole.SUPERADMIN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let dbSession: ClientSession | null = null;
  try {
    const body = await request.json();
    const { cid, title, description, coverImage, tags, initialContent } = body;
    console.log('Received data:', { cid, title, description, initialContent: initialContent?.substring(0, 50) + '...', coverImage, tags });

    // --- Validation --- 
    if (!cid || !title || !description || !initialContent) {
      return NextResponse.json({ success: false, error: 'Missing required fields: cid, title, description, initialContent' }, { status: 400 });
    }
    if (!/^[a-z]$/.test(cid)) {
      return NextResponse.json({ success: false, error: 'Invalid CID format. Must be a single lowercase letter.' }, { status: 400 });
    }
    if (typeof initialContent !== 'string' || initialContent.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Initial content cannot be empty.' }, { status: 400 });
    }
    // --- End Validation ---

    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect(); // Ensure connection FIRST

    // Start session from the mongoose connection AFTER connecting
    dbSession = await mongoose.connection.startSession();
    console.log('Database connected, session started.');

    let savedConcept: IConceptDocument | null = null;
    let savedSentences: ISentence[] = [];

    await dbSession.withTransaction(async (currentSession) => {
      console.log('Starting transaction...');
      const existingConcept = await Concept.findOne({ cid }).session(currentSession);
      if (existingConcept) {
        throw new Error(`Conflict: Concept with CID '${cid}' already exists.`);
      }
      console.log(`CID '${cid}' is available.`);

      const newConceptData: Partial<IConcept> = {
        cid,
        title,
        description,
        createdAt: new Date(),
        ...(coverImage && { coverImage }),
        ...(tags && Array.isArray(tags) && { tags }),
      };
      const newConcept = new Concept(newConceptData);
      savedConcept = await newConcept.save({ session: currentSession });
      if (!savedConcept) {
        throw new Error('Failed to save new concept within transaction.');
      }
      console.log('New concept saved within transaction:', savedConcept._id);

      const parsedSentences: ParsedSentence[] = parseMarkdownToSentences(initialContent, cid);
      if (parsedSentences.length === 0) {
        throw new Error('Parsing Error: No valid content blocks found in initial content.');
      }

      const sentenceDocsToInsert = parsedSentences.map((sentence, index, arr) => ({
        ...sentence,
        psid: index > 0 ? arr[index - 1].sid : undefined,
        nsid: index < arr.length - 1 ? arr[index + 1].sid : undefined,
      }));

      console.log(`Prepared ${sentenceDocsToInsert.length} sentences for saving.`);
      const insertedDocs = await Sentence.insertMany(sentenceDocsToInsert, { session: currentSession });
      savedSentences = insertedDocs as ISentence[];
      console.log(`Saved ${savedSentences.length} sentences within transaction.`);

      console.log('Transaction successful.');
    });

    // Final check AFTER transaction succeeded
    if (!savedConcept) {
      throw new Error('Concept object is unexpectedly null after successful transaction.');
    }

    // ---> MOVE SUCCESS RESPONSE INSIDE TRY BLOCK <--- 
    console.log('Returning success response...');
    // Explicitly cast savedConcept to IConceptDocument to resolve type error
    const finalConcept = savedConcept as IConceptDocument;

    return NextResponse.json({
      success: true,
      message: `Concept '${finalConcept.title}' and ${savedSentences.length} sentences created successfully.`,
      concept: finalConcept.toObject(), // Use .toObject() for plain JS object
      sentenceCount: savedSentences.length
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in /api/admin/concepts POST handler:', error);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400; errorMessage = error.message;
    } else if (error instanceof SyntaxError) {
      statusCode = 400; errorMessage = 'Invalid JSON body';
    } else if (error.message?.startsWith('Conflict:')) {
      statusCode = 409; errorMessage = error.message;
    } else if (error.message?.startsWith('Parsing Error:')) {
      statusCode = 400; errorMessage = error.message;
    } else if (error.message) {
      if (error.message === 'Concept object is unexpectedly null after successful transaction.' || error.message === 'Failed to save new concept within transaction.') {
        errorMessage = error.message;
      } else {
        errorMessage = 'An error occurred during concept creation.';
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });

  } finally {
    if (dbSession) {
      await dbSession.endSession();
      console.log('Session ended.');
    }
  }
}

// GET handler - use correct connect method
export async function GET() {
  try {
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect(); // Ensure connection
    const concepts = await Concept.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, concepts }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/admin/concepts GET handler:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
} 
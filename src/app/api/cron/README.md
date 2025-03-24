# ACRONTU Cron Job System

## Overview

ACRONTU (Abstract Contribution Recognition and Orchestration Neuro-Technical Utility) is the operational manifestation of ABSTRACTU. It executes scheduled processes to evaluate, store, and record contributions on the ABSTRACTU platform.

This system implements a hybrid architecture that:
1. Manages contributions in MongoDB during drafting and evaluation
2. Stores approved contributions permanently on Filecoin
3. Records metadata and statuses on the Abstract blockchain
4. Orchestrates evaluation using foundation models (AI)

## Architecture

The ACRONTU cron system is built on:

- **Next.js API Routes**: Serverless functions that execute on a schedule
- **Vercel Cron Jobs**: Scheduled trigger mechanism for the API routes
- **MongoDB**: Temporary storage for drafts and evaluation caching
- **Filecoin**: Permanent storage for approved contributions
- **Abstract Blockchain**: Smart contract integration for verification and indexing

Each cron job is designed to handle a specific aspect of the ACRONTU workflow, allowing for specialized processing and error isolation.

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Evaluate | Every 10 minutes | Processes pending contributions, evaluates them using foundation models, and either approves (storing on Filecoin and registering on blockchain) or rejects them based on evaluation scores. |

## Development

### Local Testing

1. Start your Next.js development server:
   ```
   npm run dev
   ```

2. Use the test script to trigger the cron job locally:
   ```
   npm run test:cron
   ```

3. Configure foundation models in `.env.local` to use real evaluation:
   ```
   FOUNDATION_MODELS=claude,gpt4
   MODEL_claude_NAME=Claude 3.7 Sonnet
   MODEL_claude_ENDPOINT=https://api.anthropic.com/v1/messages
   MODEL_claude_API_KEY=your_anthropic_key
   MODEL_claude_WEIGHT=2
   MODEL_claude_VERSION=3.7.0
   ```

### Monitoring

Logs for cron job execution are available in the Vercel dashboard under the "Functions" tab. Each job logs its start, progress, and completion/error status.

## Production

In production, cron jobs are executed automatically by Vercel at the scheduled intervals. 

To deploy:
1. Ensure all required environment variables are set in the Vercel project settings
2. Push your changes to the repository connected to Vercel
3. Verify cron settings in the Vercel dashboard under "Settings > Cron Jobs"

## Security

All cron jobs are protected by an authorization token specified in the `CRON_SECRET` environment variable. This prevents unauthorized triggering of processing jobs.

For production usage, set a strong random value for `CRON_SECRET` in your environment variables.

## Related Files

- **`/src/utils/acrontu/evaluationService.ts`**: Core service that orchestrates the evaluation process
- **`/src/utils/mongodb/*`**: MongoDB client and models for contribution storage
- **`/src/utils/filecoin/*`**: Filecoin client for permanent content storage
- **`/src/utils/blockchain/*`**: Blockchain client for interacting with smart contracts
- **`/src/utils/ai/*`**: AI evaluation system using foundation models
- **`/src/app/api/cron/evaluate/route.ts`**: API route for the evaluation cron job 
'use client';

export default function SubmissionsPage() {
  return (
    <div className="docs-page">
      <h1>Submissions</h1>

      <p>
        Submissions are the core content units in the ABSTRACTU platform, representing creative
        works submitted by authors for evaluation and inclusion.
      </p>

      <h2>What are Submissions?</h2>

      <p>
        In ABSTRACTU, a submission is a piece of content created by an author and submitted to the
        platform for evaluation. Each submission includes:
      </p>

      <ul>
        <li>Title and description</li>
        <li>Content (stored on IPFS with the hash recorded on-chain)</li>
        <li>Metadata about the author and submission time</li>
        <li>Status information tracking its progress through the system</li>
      </ul>

      <h2>Submission Data Structure</h2>

      <p>Each submission in ABSTRACTU is represented by a structured data type:</p>

      <pre><code>{`struct Submission {
    uint256 id;               // Unique identifier
    address author;           // Address of the content creator
    bytes32 contentHash;      // IPFS hash of the content
    string title;             // Title of the submission
    string description;       // Brief description
    uint256 timestamp;        // Time of creation/last update
    SubmissionStatus status;  // Current status
    uint256 evaluationScore;  // Score (0-100) if evaluated
    string feedback;          // Feedback from evaluation
}`}</code></pre>

      <h2>Submission Lifecycle</h2>

      <p>
        Submissions follow a defined lifecycle, passing through several states:
      </p>

      <h3>1. Draft</h3>

      <p>When a submission is first created, it enters the Draft state:</p>

      <ul>
        <li>The author can make changes to the title, description, and content</li>
        <li>The submission is not yet visible to evaluators</li>
        <li>The author can update the submission any number of times</li>
      </ul>

      <h3>2. Submitted</h3>

      <p>When the author finalizes their submission, it moves to the Submitted state:</p>

      <ul>
        <li>The submission can no longer be modified by the author</li>
        <li>It becomes available for evaluation</li>
        <li>It awaits review by foundation models or human evaluators</li>
      </ul>

      <h3>3. Approved</h3>

      <p>If the submission meets the platform's criteria, it is Approved:</p>

      <ul>
        <li>The submission becomes visible on the platform</li>
        <li>It may be eligible for tokenization or rewards</li>
        <li>It contributes to the author's reputation</li>
      </ul>

      <h3>4. Rejected</h3>

      <p>If the submission does not meet the platform's criteria, it is Rejected:</p>

      <ul>
        <li>The author receives feedback explaining the rejection</li>
        <li>The submission is not made public on the platform</li>
        <li>The author may create a new submission incorporating the feedback</li>
      </ul>

      <h3>5. Purged</h3>

      <p>In certain cases, submissions may be Purged from the system:</p>

      <ul>
        <li>This might occur for content policy violations</li>
        <li>Purged submissions are no longer counted in the active submission count</li>
        <li>The submission data remains accessible for historical purposes</li>
      </ul>

      <h2>Submission Storage</h2>

      <p>
        ABSTRACTU stores submission data efficiently using the Diamond storage pattern:
      </p>

      <pre><code>{`struct SubmissionStorage {
    // Mapping from submission ID to Submission
    mapping(uint256 => Submission) submissions;
    
    // Mapping from author address to their submission IDs
    mapping(address => uint256[]) authorSubmissions;
    
    // Counter for unique submission IDs
    uint256 submissionCounter;
    
    // Number of active submissions (not purged)
    uint256 activeSubmissionCount;
    
    // Blacklisted authors
    mapping(address => bool) blacklistedAuthors;
}`}</code></pre>

      <p>This structure allows for:</p>

      <ul>
        <li>Efficient retrieval of submissions by ID</li>
        <li>Listing all submissions by a specific author</li>
        <li>Tracking the total number of submissions</li>
        <li>Managing author blacklisting for content policy enforcement</li>
      </ul>

      <h2>Creating a Submission</h2>

      <p>Authors create submissions by interacting with the SubmissionFacet:</p>

      <ol>
        <li>The author prepares their content and uploads it to IPFS</li>
        <li>
          The author calls the <code>createSubmission</code> function with title, description,
          and content hash
        </li>
        <li>The system creates a new submission in Draft status</li>
        <li>The author can update the submission as needed</li>
        <li>
          When ready, the author finalizes the submission, changing its status to Submitted
        </li>
      </ol>

      <h2>Evaluation Process</h2>

      <p>Once a submission is finalized, it enters the evaluation process:</p>

      <ol>
        <li>The submission appears in the evaluation queue</li>
        <li>Foundation models or human evaluators review the submission</li>
        <li>The submission receives a score and feedback</li>
        <li>Based on the evaluation, the submission is either Approved or Rejected</li>
        <li>The author is notified of the evaluation result</li>
      </ol>

      <h2>Author Management</h2>

      <p>ABSTRACTU includes mechanisms for author management:</p>

      <ul>
        <li>
          <strong>Author Tracking</strong>: Each submission is linked to its author's address
        </li>
        <li><strong>Author History</strong>: Authors can view their submission history</li>
        <li>
          <strong>Blacklisting</strong>: Platform administrators can blacklist authors who violate
          content policies
        </li>
      </ul>

      <h2>Content Storage</h2>

      <p>ABSTRACTU uses a hybrid approach to content storage:</p>

      <ul>
        <li>Content is stored off-chain in IPFS for efficiency and scalability</li>
        <li>Content hashes are stored on-chain to ensure authenticity and provenance</li>
        <li>The combination provides both scalability and verifiability</li>
      </ul>

      <h2>Privacy Considerations</h2>

      <p>
        While the core ABSTRACTU platform operates with public submissions, future enhancements
        may include:
      </p>

      <ul>
        <li>Encrypted content with selective disclosure</li>
        <li>Zero-knowledge proofs for verified but private content</li>
        <li>Access control mechanisms for premium or restricted content</li>
      </ul>

      <h2>Integrations</h2>

      <p>The submission system integrates with other platform components:</p>

      <ul>
        <li><strong>Evaluation System</strong>: For content review and scoring</li>
        <li><strong>Tokenization</strong>: For rewarding approved submissions</li>
        <li><strong>Discovery</strong>: For helping users find relevant content</li>
        <li><strong>Governance</strong>: For community-based content moderation</li>
      </ul>

      <style jsx>{`
        .docs-page {
          font-family: var(--font-inter);
          color: #e0e0e0;
        }
        h1, h2, h3, h4 {
          font-family: var(--font-crimson);
          color: #cc9c42;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }
        h2 {
          font-size: 1.75rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        h3 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        h4 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        p, ul, ol {
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        pre {
          background: #1a1a1a;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        code {
          font-family: monospace;
          color: #cc9c42;
        }
        a {
          color: #cc9c42;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        ul, ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        li {
          margin-bottom: 0.5rem;
        }
        strong {
          color: #cc9c42;
        }
      `}</style>
    </div>
  );
} 
'use client';

export default function SubmissionFacetPage() {
  return (
    <div className="docs-page">
      <h1>Submission Facet</h1>

      <p>
        The SubmissionFacet is a core component of the ABSTRACTU platform, responsible for managing
        the content submission process. This facet handles the entire lifecycle of submissions,
        from creation to evaluation.
      </p>

      <h2>Overview</h2>

      <p>
        The SubmissionFacet enables content creators (authors) to submit their work to the ABSTRACTU
        platform. It tracks the status of submissions, facilitates evaluation by foundation models,
        and maintains a record of all submitted content.
      </p>

      <h2>Submission Lifecycle</h2>

      <p>Submissions in ABSTRACTU follow a defined lifecycle:</p>

      <ol>
        <li>
          <strong>Draft</strong>: Initial creation stage, where authors can update and modify
          their submissions
        </li>
        <li>
          <strong>Submitted</strong>: The submission is finalized by the author and awaiting
          evaluation
        </li>
        <li>
          <strong>Approved</strong>: The submission has been evaluated and approved for the platform
        </li>
        <li>
          <strong>Rejected</strong>: The submission has been evaluated and rejected
        </li>
        <li>
          <strong>Purged</strong>: The submission has been removed from the active system
        </li>
      </ol>

      <h2>Storage Structure</h2>

      <p>The SubmissionFacet uses a dedicated storage structure to maintain submission data:</p>

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

      <h2>Functions</h2>

      <p>The SubmissionFacet provides several functions for interacting with submissions:</p>

      <h3>Author Functions</h3>

      <h4>createSubmission</h4>

      <pre><code>{`function createSubmission(
    string calldata _title,
    string calldata _description,
    bytes32 _contentHash
) external returns (uint256)`}</code></pre>

      <p>Creates a new submission in Draft status.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_title</code>: Title of the submission</li>
        <li><code>_description</code>: Brief description of the submission</li>
        <li><code>_contentHash</code>: IPFS hash of the submission content</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Author must not be blacklisted</li>
        <li>Title must not be empty</li>
        <li>Description must not be empty</li>
        <li>Content hash must not be empty</li>
      </ul>

      <p><strong>Returns:</strong></p>
      <ul>
        <li>The ID of the newly created submission</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>SubmissionCreated</code></li>
      </ul>

      <h4>updateSubmission</h4>

      <pre><code>{`function updateSubmission(
    uint256 _submissionId,
    string calldata _title,
    string calldata _description,
    bytes32 _contentHash
) external`}</code></pre>

      <p>Updates a draft submission.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_submissionId</code>: ID of the submission to update</li>
        <li><code>_title</code>: New title of the submission</li>
        <li><code>_description</code>: New description of the submission</li>
        <li><code>_contentHash</code>: New IPFS hash of the submission content</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Caller must be the author of the submission</li>
        <li>Submission must be in Draft status</li>
        <li>Title must not be empty</li>
        <li>Description must not be empty</li>
        <li>Content hash must not be empty</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>SubmissionUpdated</code></li>
      </ul>

      <h4>finalizeSubmission</h4>

      <pre><code>{`function finalizeSubmission(uint256 _submissionId) external`}</code></pre>

      <p>Finalizes a submission, changing its status from Draft to Submitted.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_submissionId</code>: ID of the submission to finalize</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Caller must be the author of the submission</li>
        <li>Submission must be in Draft status</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>SubmissionStatusChanged</code></li>
      </ul>

      <h3>Admin/Foundation Functions</h3>

      <h4>evaluateSubmission</h4>

      <pre><code>{`function evaluateSubmission(
    uint256 _submissionId,
    bool _approved,
    uint256 _evaluationScore,
    string calldata _feedback
) external`}</code></pre>

      <p>Evaluates a submission, changing its status to Approved or Rejected.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_submissionId</code>: ID of the submission to evaluate</li>
        <li><code>_approved</code>: Whether the submission is approved</li>
        <li><code>_evaluationScore</code>: Score assigned to the submission (0-100)</li>
        <li><code>_feedback</code>: Feedback for the submission</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Caller must have the FOUNDATION_ROLE</li>
        <li>Submission must be in Submitted status</li>
        <li>Evaluation score must be between 0 and 100</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>SubmissionEvaluated</code></li>
        <li><code>SubmissionStatusChanged</code></li>
      </ul>

      <h4>purgeSubmission</h4>

      <pre><code>{`function purgeSubmission(uint256 _submissionId) external`}</code></pre>

      <p>Removes a submission from the active system.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_submissionId</code>: ID of the submission to purge</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Caller must have the ADMIN_ROLE</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>SubmissionStatusChanged</code></li>
      </ul>

      <h4>blacklistAuthor</h4>

      <pre><code>{`function blacklistAuthor(address _author, bool _blacklisted) external`}</code></pre>

      <p>Blacklists or unblacklists an author.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_author</code>: Address of the author to blacklist/unblacklist</li>
        <li><code>_blacklisted</code>: Whether the author should be blacklisted</li>
      </ul>

      <p><strong>Requirements:</strong></p>
      <ul>
        <li>Caller must have the ADMIN_ROLE</li>
      </ul>

      <p><strong>Events:</strong></p>
      <ul>
        <li><code>AuthorBlacklisted</code></li>
      </ul>

      <h3>View Functions</h3>

      <h4>getSubmission</h4>

      <pre><code>{`function getSubmission(uint256 _submissionId) external view returns (Submission memory)`}</code></pre>

      <p>Retrieves a submission by ID.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_submissionId</code>: ID of the submission to retrieve</li>
      </ul>

      <p><strong>Returns:</strong></p>
      <ul>
        <li>The submission details</li>
      </ul>

      <h4>getAuthorSubmissions</h4>

      <pre><code>{`function getAuthorSubmissions(address _author) external view returns (uint256[] memory)`}</code></pre>

      <p>Retrieves the submission IDs for a specific author.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_author</code>: Address of the author</li>
      </ul>

      <p><strong>Returns:</strong></p>
      <ul>
        <li>Array of submission IDs belonging to the author</li>
      </ul>

      <h4>isAuthorBlacklisted</h4>

      <pre><code>{`function isAuthorBlacklisted(address _author) external view returns (bool)`}</code></pre>

      <p>Checks if an author is blacklisted.</p>

      <p><strong>Parameters:</strong></p>
      <ul>
        <li><code>_author</code>: Address of the author to check</li>
      </ul>

      <p><strong>Returns:</strong></p>
      <ul>
        <li>Whether the author is blacklisted</li>
      </ul>

      <h4>getActiveSubmissionCount</h4>

      <pre><code>{`function getActiveSubmissionCount() external view returns (uint256)`}</code></pre>

      <p>Returns the number of active submissions.</p>

      <p><strong>Returns:</strong></p>
      <ul>
        <li>The count of active submissions</li>
      </ul>

      <h2>Events</h2>

      <p>The SubmissionFacet emits the following events:</p>

      <h3>SubmissionCreated</h3>

      <pre><code>{`event SubmissionCreated(
    uint256 indexed submissionId,
    address indexed author,
    string title,
    bytes32 contentHash
);`}</code></pre>

      <p>Emitted when a new submission is created.</p>

      <h3>SubmissionUpdated</h3>

      <pre><code>{`event SubmissionUpdated(
    uint256 indexed submissionId,
    string title,
    bytes32 contentHash
);`}</code></pre>

      <p>Emitted when a submission is updated.</p>

      <h3>SubmissionStatusChanged</h3>

      <pre><code>{`event SubmissionStatusChanged(
    uint256 indexed submissionId,
    SubmissionStatus status
);`}</code></pre>

      <p>Emitted when a submission&apos;s status changes.</p>

      <h3>SubmissionEvaluated</h3>

      <pre><code>{`event SubmissionEvaluated(
    uint256 indexed submissionId,
    bool approved,
    uint256 evaluationScore,
    string feedback
);`}</code></pre>

      <p>Emitted when a submission is evaluated.</p>

      <h3>AuthorBlacklisted</h3>

      <pre><code>{`event AuthorBlacklisted(
    address indexed author,
    bool blacklisted
);`}</code></pre>

      <p>Emitted when an author is blacklisted or unblacklisted.</p>

      <h2>Integration</h2>

      <p>The SubmissionFacet integrates with other components of the ABSTRACTU system:</p>

      <ul>
        <li>
          <strong>Diamond Contract</strong>: As a facet of the Diamond contract, it shares storage
          with other facets
        </li>
        <li>
          <strong>LibDiamond</strong>: Uses the Diamond storage pattern for efficient storage access
        </li>
        <li>
          <strong>IPFS</strong>: Content is stored off-chain with hashes recorded on-chain
        </li>
        <li>
          <strong>Foundation Models</strong>: Evaluations may be conducted by foundation models
        </li>
      </ul>

      <h2>Future Enhancements</h2>

      <p>Planned enhancements for the SubmissionFacet include:</p>

      <ul>
        <li>
          <strong>Tokenized Rewards</strong>: Integration with a token system to reward successful
          submissions
        </li>
        <li>
          <strong>Zero-Knowledge Proofs</strong>: For private content with selective disclosure
        </li>
        <li>
          <strong>Categorization System</strong>: To organize submissions by topic or type
        </li>
        <li>
          <strong>DAO-Based Evaluation</strong>: Moving toward a more decentralized evaluation
          process
        </li>
      </ul>
    </div>
  );
} 
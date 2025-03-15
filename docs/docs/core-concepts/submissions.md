---
sidebar_position: 2
---

# Submissions

Submissions are the core content units in the ABSTRACTU platform, representing creative works submitted by authors for evaluation and inclusion.

## What are Submissions?

In ABSTRACTU, a submission is a piece of content created by an author and submitted to the platform for evaluation. Each submission includes:

- Title and description
- Content (stored on IPFS with the hash recorded on-chain)
- Metadata about the author and submission time
- Status information tracking its progress through the system

## Submission Data Structure

Each submission in ABSTRACTU is represented by a structured data type:

```solidity
struct Submission {
    uint256 id;               // Unique identifier
    address author;           // Address of the content creator
    bytes32 contentHash;      // IPFS hash of the content
    string title;             // Title of the submission
    string description;       // Brief description
    uint256 timestamp;        // Time of creation/last update
    SubmissionStatus status;  // Current status
    uint256 evaluationScore;  // Score (0-100) if evaluated
    string feedback;          // Feedback from evaluation
}
```

## Submission Lifecycle

Submissions follow a defined lifecycle, passing through several states:

### 1. Draft

When a submission is first created, it enters the Draft state:

- The author can make changes to the title, description, and content
- The submission is not yet visible to evaluators
- The author can update the submission any number of times

### 2. Submitted

When the author finalizes their submission, it moves to the Submitted state:

- The submission can no longer be modified by the author
- It becomes available for evaluation
- It awaits review by foundation models or human evaluators

### 3. Approved

If the submission meets the platform's criteria, it is Approved:

- The submission becomes visible on the platform
- It may be eligible for tokenization or rewards
- It contributes to the author's reputation

### 4. Rejected

If the submission does not meet the platform's criteria, it is Rejected:

- The author receives feedback explaining the rejection
- The submission is not made public on the platform
- The author may create a new submission incorporating the feedback

### 5. Purged

In certain cases, submissions may be Purged from the system:

- This might occur for content policy violations
- Purged submissions are no longer counted in the active submission count
- The submission data remains accessible for historical purposes

## Submission Storage

ABSTRACTU stores submission data efficiently using the Diamond storage pattern:

```solidity
struct SubmissionStorage {
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
}
```

This structure allows for:

- Efficient retrieval of submissions by ID
- Listing all submissions by a specific author
- Tracking the total number of submissions
- Managing author blacklisting for content policy enforcement

## Creating a Submission

Authors create submissions by interacting with the SubmissionFacet:

1. The author prepares their content and uploads it to IPFS
2. The author calls the `createSubmission` function with title, description, and content hash
3. The system creates a new submission in Draft status
4. The author can update the submission as needed
5. When ready, the author finalizes the submission, changing its status to Submitted

## Evaluation Process

Once a submission is finalized, it enters the evaluation process:

1. The submission appears in the evaluation queue
2. Foundation models or human evaluators review the submission
3. The submission receives a score and feedback
4. Based on the evaluation, the submission is either Approved or Rejected
5. The author is notified of the evaluation result

## Author Management

ABSTRACTU includes mechanisms for author management:

- **Author Tracking**: Each submission is linked to its author's address
- **Author History**: Authors can view their submission history
- **Blacklisting**: Platform administrators can blacklist authors who violate content policies

## Content Storage

ABSTRACTU uses a hybrid approach to content storage:

- Content is stored off-chain in IPFS for efficiency and scalability
- Content hashes are stored on-chain to ensure authenticity and provenance
- The combination provides both scalability and verifiability

## Privacy Considerations

While the core ABSTRACTU platform operates with public submissions, future enhancements may include:

- Encrypted content with selective disclosure
- Zero-knowledge proofs for verified but private content
- Access control mechanisms for premium or restricted content

## Integrations

The submission system integrates with other platform components:

- **Evaluation System**: For content review and scoring
- **Tokenization**: For rewarding approved submissions
- **Discovery**: For helping users find relevant content
- **Governance**: For community-based content moderation 
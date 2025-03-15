---
sidebar_position: 3
---

# Submission Facet

The SubmissionFacet is a core component of the ABSTRACTU platform, responsible for managing the content submission process. This facet handles the entire lifecycle of submissions, from creation to evaluation.

## Overview

The SubmissionFacet enables content creators (authors) to submit their work to the ABSTRACTU platform. It tracks the status of submissions, facilitates evaluation by foundation models, and maintains a record of all submitted content.

## Submission Lifecycle

Submissions in ABSTRACTU follow a defined lifecycle:

1. **Draft**: Initial creation stage, where authors can update and modify their submissions
2. **Submitted**: The submission is finalized by the author and awaiting evaluation
3. **Approved**: The submission has been evaluated and approved for the platform
4. **Rejected**: The submission has been evaluated and rejected
5. **Purged**: The submission has been removed from the active system

## Storage Structure

The SubmissionFacet uses a dedicated storage structure to maintain submission data:

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

## Functions

The SubmissionFacet provides several functions for interacting with submissions:

### Author Functions

#### createSubmission

```solidity
function createSubmission(
    string calldata _title,
    string calldata _description,
    bytes32 _contentHash
) external returns (uint256)
```

Creates a new submission in Draft status.

**Parameters:**
- `_title`: Title of the submission
- `_description`: Brief description of the submission
- `_contentHash`: IPFS hash of the submission content

**Requirements:**
- Author must not be blacklisted
- Title must not be empty
- Description must not be empty
- Content hash must not be empty

**Returns:**
- The ID of the newly created submission

**Events:**
- `SubmissionCreated`

#### updateSubmission

```solidity
function updateSubmission(
    uint256 _submissionId,
    string calldata _title,
    string calldata _description,
    bytes32 _contentHash
) external
```

Updates a draft submission.

**Parameters:**
- `_submissionId`: ID of the submission to update
- `_title`: New title of the submission
- `_description`: New description of the submission
- `_contentHash`: New IPFS hash of the submission content

**Requirements:**
- Caller must be the author of the submission
- Submission must be in Draft status
- Title must not be empty
- Description must not be empty
- Content hash must not be empty

**Events:**
- `SubmissionUpdated`

#### finalizeSubmission

```solidity
function finalizeSubmission(uint256 _submissionId) external
```

Finalizes a submission, changing its status from Draft to Submitted.

**Parameters:**
- `_submissionId`: ID of the submission to finalize

**Requirements:**
- Caller must be the author of the submission
- Submission must be in Draft status

**Events:**
- `SubmissionStatusChanged`

### Admin/Foundation Functions

#### evaluateSubmission

```solidity
function evaluateSubmission(
    uint256 _submissionId,
    bool _approved,
    uint256 _evaluationScore,
    string calldata _feedback
) external
```

Evaluates a submission, changing its status to Approved or Rejected.

**Parameters:**
- `_submissionId`: ID of the submission to evaluate
- `_approved`: Whether the submission is approved
- `_evaluationScore`: Score assigned to the submission (0-100)
- `_feedback`: Feedback for the submission

**Requirements:**
- Caller must have the FOUNDATION_ROLE
- Submission must be in Submitted status
- Evaluation score must be between 0 and 100

**Events:**
- `SubmissionEvaluated`
- `SubmissionStatusChanged`

#### purgeSubmission

```solidity
function purgeSubmission(uint256 _submissionId) external
```

Removes a submission from the active system.

**Parameters:**
- `_submissionId`: ID of the submission to purge

**Requirements:**
- Caller must have the ADMIN_ROLE

**Events:**
- `SubmissionStatusChanged`

#### blacklistAuthor

```solidity
function blacklistAuthor(address _author, bool _blacklisted) external
```

Blacklists or unblacklists an author.

**Parameters:**
- `_author`: Address of the author to blacklist/unblacklist
- `_blacklisted`: Whether the author should be blacklisted

**Requirements:**
- Caller must have the ADMIN_ROLE

**Events:**
- `AuthorBlacklisted`

### View Functions

#### getSubmission

```solidity
function getSubmission(uint256 _submissionId) external view returns (Submission memory)
```

Retrieves a submission by ID.

**Parameters:**
- `_submissionId`: ID of the submission to retrieve

**Returns:**
- The submission details

#### getAuthorSubmissions

```solidity
function getAuthorSubmissions(address _author) external view returns (uint256[] memory)
```

Retrieves the submission IDs for a specific author.

**Parameters:**
- `_author`: Address of the author

**Returns:**
- Array of submission IDs belonging to the author

#### isAuthorBlacklisted

```solidity
function isAuthorBlacklisted(address _author) external view returns (bool)
```

Checks if an author is blacklisted.

**Parameters:**
- `_author`: Address of the author to check

**Returns:**
- Whether the author is blacklisted

#### getActiveSubmissionCount

```solidity
function getActiveSubmissionCount() external view returns (uint256)
```

Returns the number of active submissions.

**Returns:**
- The count of active submissions

## Events

The SubmissionFacet emits the following events:

### SubmissionCreated

```solidity
event SubmissionCreated(
    uint256 indexed submissionId,
    address indexed author,
    string title,
    bytes32 contentHash
);
```

Emitted when a new submission is created.

### SubmissionUpdated

```solidity
event SubmissionUpdated(
    uint256 indexed submissionId,
    string title,
    bytes32 contentHash
);
```

Emitted when a submission is updated.

### SubmissionStatusChanged

```solidity
event SubmissionStatusChanged(
    uint256 indexed submissionId,
    SubmissionStatus status
);
```

Emitted when a submission's status changes.

### SubmissionEvaluated

```solidity
event SubmissionEvaluated(
    uint256 indexed submissionId,
    bool approved,
    uint256 evaluationScore,
    string feedback
);
```

Emitted when a submission is evaluated.

### AuthorBlacklisted

```solidity
event AuthorBlacklisted(
    address indexed author,
    bool blacklisted
);
```

Emitted when an author is blacklisted or unblacklisted.

## Integration

The SubmissionFacet integrates with other components of the ABSTRACTU system:

- **Diamond Contract**: As a facet of the Diamond contract, it shares storage with other facets
- **LibDiamond**: Uses the Diamond storage pattern for efficient storage access
- **IPFS**: Content is stored off-chain with hashes recorded on-chain
- **Foundation Models**: Evaluations may be conducted by foundation models

## Future Enhancements

Planned enhancements for the SubmissionFacet include:

- **Tokenized Rewards**: Integration with a token system to reward successful submissions
- **Zero-Knowledge Proofs**: For private content with selective disclosure
- **Categorization System**: To organize submissions by topic or type
- **DAO-Based Evaluation**: Moving toward a more decentralized evaluation process 
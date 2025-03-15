# SubmissionFacet

The SubmissionFacet manages the content submission process for the ABSTRACTU platform. It provides functionality for users to create, update, and finalize submissions, as well as for administrators to evaluate, approve, reject, or purge submissions.

## Overview

The ABSTRACTU platform allows users to contribute knowledge and ideas through submissions. Each submission goes through a lifecycle:

1. **Draft**: Initial state where authors can create and edit their submissions
2. **Submitted**: Finalized by the author and ready for evaluation
3. **Approved**: Positively evaluated by the foundation
4. **Rejected**: Negatively evaluated by the foundation
5. **Purged**: Completely removed from active storage

## Storage Structure

The SubmissionFacet uses a dedicated storage structure to maintain submission data:

```solidity
struct SubmissionStorage {
    mapping(uint256 => Submission) submissions;
    mapping(address => uint256[]) authorSubmissions;
    uint256 submissionCounter;
    uint256 activeSubmissionCount;
    mapping(address => bool) blacklistedAuthors;
}
```

## Functions

### Author Functions

These functions are available to content authors:

#### `createSubmission`

```solidity
function createSubmission(
    string calldata _contentHash,
    string calldata _title,
    string calldata _description
) external notBlacklisted returns (uint256)
```

Creates a new submission in draft status.

- **Parameters**:
  - `_contentHash`: IPFS hash of the submission content
  - `_title`: Title of the submission
  - `_description`: Brief description of the submission
- **Returns**: The ID of the newly created submission
- **Requirements**:
  - Author is not blacklisted
- **Emits**: `SubmissionCreated` event

#### `updateSubmission`

```solidity
function updateSubmission(
    uint256 _submissionId,
    string calldata _contentHash,
    string calldata _title,
    string calldata _description
) external submissionExists(_submissionId) onlySubmissionAuthor(_submissionId) onlyDraft(_submissionId)
```

Updates an existing draft submission.

- **Parameters**:
  - `_submissionId`: ID of the submission to update
  - `_contentHash`: New IPFS hash of the content
  - `_title`: New title
  - `_description`: New description
- **Requirements**:
  - Submission exists
  - Caller is the submission author
  - Submission is in draft status
- **Emits**: `SubmissionUpdated` event

#### `finalizeSubmission`

```solidity
function finalizeSubmission(uint256 _submissionId) 
    external 
    submissionExists(_submissionId) 
    onlySubmissionAuthor(_submissionId) 
    onlyDraft(_submissionId)
```

Finalizes a submission, changing its status from Draft to Submitted and making it available for evaluation.

- **Parameters**:
  - `_submissionId`: ID of the submission to finalize
- **Requirements**:
  - Submission exists
  - Caller is the submission author
  - Submission is in draft status
- **Emits**: `SubmissionStatusChanged` event

### Admin/Foundation Functions

These functions are restricted to contract administrators or the foundation:

#### `evaluateSubmission`

```solidity
function evaluateSubmission(
    uint256 _submissionId,
    bool _approved,
    uint256 _score,
    string calldata _feedback
) external submissionExists(_submissionId) onlyAdminOrFoundation
```

Evaluates a submitted content, approving or rejecting it and providing a score and feedback.

- **Parameters**:
  - `_submissionId`: ID of the submission to evaluate
  - `_approved`: Whether the submission is approved
  - `_score`: Score assigned to the submission (0-100)
  - `_feedback`: Evaluation feedback
- **Requirements**:
  - Submission exists
  - Caller is an admin or foundation member
  - Submission is in submitted status
  - Score is between 0 and 100
- **Emits**: `SubmissionStatusChanged` and `SubmissionEvaluated` events

#### `purgeSubmission`

```solidity
function purgeSubmission(uint256 _submissionId) external submissionExists(_submissionId) onlyAdminOrFoundation
```

Purges a rejected submission, marking it as removed from active storage.

- **Parameters**:
  - `_submissionId`: ID of the submission to purge
- **Requirements**:
  - Submission exists
  - Caller is an admin or foundation member
  - Submission is in rejected status
- **Emits**: `SubmissionStatusChanged` event

#### `blacklistAuthor`

```solidity
function blacklistAuthor(address _author) external onlyAdminOrFoundation
```

Blacklists an author, preventing them from creating new submissions.

- **Parameters**:
  - `_author`: Address of the author to blacklist
- **Requirements**:
  - Caller is an admin or foundation member
- **Emits**: `AuthorBlacklisted` event

### View Functions

These functions provide read-only access to submission data:

#### `getSubmission`

```solidity
function getSubmission(uint256 _submissionId) external view submissionExists(_submissionId) returns (
    uint256 id,
    address author,
    string memory contentHash,
    string memory title,
    string memory description,
    uint256 timestamp,
    SubmissionStatus status,
    uint256 evaluationScore,
    string memory evaluationFeedback
)
```

Retrieves the complete data for a specific submission.

- **Parameters**:
  - `_submissionId`: ID of the submission to retrieve
- **Returns**: Complete submission data including ID, author, content hash, title, description, timestamp, status, evaluation score, and feedback
- **Requirements**:
  - Submission exists

#### `getAuthorSubmissions`

```solidity
function getAuthorSubmissions(address _author) external view returns (uint256[] memory)
```

Gets all submission IDs created by a specific author.

- **Parameters**:
  - `_author`: Address of the author
- **Returns**: Array of submission IDs

#### `isAuthorBlacklisted`

```solidity
function isAuthorBlacklisted(address _author) external view returns (bool)
```

Checks if an author is blacklisted.

- **Parameters**:
  - `_author`: Address of the author
- **Returns**: True if the author is blacklisted

#### `getActiveSubmissionCount`

```solidity
function getActiveSubmissionCount() external view returns (uint256)
```

Gets the total count of active (non-purged) submissions.

- **Returns**: Count of active submissions

## Events

The SubmissionFacet emits the following events:

- `SubmissionCreated(uint256 indexed submissionId, address indexed author, string title)`
- `SubmissionUpdated(uint256 indexed submissionId, address indexed author)`
- `SubmissionStatusChanged(uint256 indexed submissionId, SubmissionStatus newStatus)`
- `SubmissionEvaluated(uint256 indexed submissionId, uint256 score)`
- `AuthorBlacklisted(address indexed author)`

## Integration with Other Components

The SubmissionFacet integrates with the following system components:

- **Diamond Contract**: As a facet of the Diamond, it shares the same contract address and can be upgraded independently.
- **LibDiamond**: Uses LibDiamond for access control (enforceIsContractOwner).
- **IPFS**: Content is stored on IPFS, with only the content hash stored on-chain.
- **Foundation Models**: The evaluation process is performed off-chain by foundation models, with results recorded on-chain by authorized addresses.

## Future Enhancements

Planned enhancements for the SubmissionFacet include:

- **Tokenization**: Integration with the $Ab2 token for rewards
- **Zero-Knowledge Proofs**: Encrypted content access mechanism
- **Content Categories**: Categorization system for submissions
- **Governance**: DAO-based evaluation process 
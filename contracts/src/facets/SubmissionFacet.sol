// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SubmissionFacet
 * @dev Manages content submissions for the ABSTRACTU platform
 * @author ABSTRACTU & Claude-3.7-Sonnet
 */
contract SubmissionFacet {
    /**
     * @dev Submission status enum
     */
    enum SubmissionStatus {
        Draft, // Initial state, editable by author
        Submitted, // Finalized, waiting for evaluation
        Approved, // Evaluated and approved
        Rejected, // Evaluated and rejected
        Purged // Removed from storage
    }

    /**
     * @dev Content submission structure
     */
    struct Submission {
        uint256 id; // Unique submission ID
        address author; // Address of the submitter
        string contentHash; // IPFS hash of the submission content
        string title; // Title of the submission
        string description; // Brief description
        uint256 timestamp; // Time of creation/last update
        SubmissionStatus status; // Current status
        uint256 evaluationScore; // Score assigned during evaluation (0-100)
        string evaluationFeedback; // Feedback from evaluation process
    }

    /**
     * @dev Storage structure for this facet
     */
    struct SubmissionStorage {
        // Mapping from submission ID to Submission
        mapping(uint256 => Submission) submissions;
        // Mapping from author address to their submission IDs
        mapping(address => uint256[]) authorSubmissions;
        // Counter for generating unique submission IDs
        uint256 submissionCounter;
        // Total count of non-purged submissions
        uint256 activeSubmissionCount;
        // Mapping to track if an address is blacklisted
        mapping(address => bool) blacklistedAuthors;
    }

    /**
     * @dev Storage position for the submission storage
     */
    bytes32 constant SUBMISSION_STORAGE_POSITION =
        keccak256("abstractu.submission.storage");

    /**
     * @dev Get submission storage
     */
    function submissionStorage()
        internal
        pure
        returns (SubmissionStorage storage ss)
    {
        bytes32 position = SUBMISSION_STORAGE_POSITION;
        assembly {
            ss.slot := position
        }
    }

    /**
     * @dev Events
     */
    event SubmissionCreated(
        uint256 indexed submissionId,
        address indexed author,
        string title
    );
    event SubmissionUpdated(
        uint256 indexed submissionId,
        address indexed author
    );
    event SubmissionStatusChanged(
        uint256 indexed submissionId,
        SubmissionStatus newStatus
    );
    event SubmissionEvaluated(uint256 indexed submissionId, uint256 score);
    event AuthorBlacklisted(address indexed author);

    /**
     * @dev Modifiers
     */
    modifier notBlacklisted() {
        SubmissionStorage storage ss = submissionStorage();
        require(
            !ss.blacklistedAuthors[msg.sender],
            "SubmissionFacet: Author is blacklisted"
        );
        _;
    }

    modifier submissionExists(uint256 _submissionId) {
        SubmissionStorage storage ss = submissionStorage();
        require(
            ss.submissions[_submissionId].author != address(0),
            "SubmissionFacet: Submission does not exist"
        );
        _;
    }

    modifier onlySubmissionAuthor(uint256 _submissionId) {
        SubmissionStorage storage ss = submissionStorage();
        require(
            ss.submissions[_submissionId].author == msg.sender,
            "SubmissionFacet: Not the submission author"
        );
        _;
    }

    modifier onlyDraft(uint256 _submissionId) {
        SubmissionStorage storage ss = submissionStorage();
        require(
            ss.submissions[_submissionId].status == SubmissionStatus.Draft,
            "SubmissionFacet: Submission is not in draft status"
        );
        _;
    }

    modifier onlyAdminOrFoundation() {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    /**
     * @notice Create a new draft submission
     * @param _contentHash IPFS hash of the submission content
     * @param _title Title of the submission
     * @param _description Brief description of the submission
     * @return submissionId The ID of the created submission
     */
    function createSubmission(
        string calldata _contentHash,
        string calldata _title,
        string calldata _description
    ) external notBlacklisted returns (uint256) {
        SubmissionStorage storage ss = submissionStorage();

        // Increment submission counter
        ss.submissionCounter++;
        uint256 newSubmissionId = ss.submissionCounter;

        // Create new submission
        Submission storage newSubmission = ss.submissions[newSubmissionId];
        newSubmission.id = newSubmissionId;
        newSubmission.author = msg.sender;
        newSubmission.contentHash = _contentHash;
        newSubmission.title = _title;
        newSubmission.description = _description;
        newSubmission.timestamp = block.timestamp;
        newSubmission.status = SubmissionStatus.Draft;

        // Add to author's submissions
        ss.authorSubmissions[msg.sender].push(newSubmissionId);
        ss.activeSubmissionCount++;

        emit SubmissionCreated(newSubmissionId, msg.sender, _title);

        return newSubmissionId;
    }

    /**
     * @notice Update a draft submission
     * @param _submissionId ID of the submission to update
     * @param _contentHash New IPFS hash of the content
     * @param _title New title
     * @param _description New description
     */
    function updateSubmission(
        uint256 _submissionId,
        string calldata _contentHash,
        string calldata _title,
        string calldata _description
    )
        external
        submissionExists(_submissionId)
        onlySubmissionAuthor(_submissionId)
        onlyDraft(_submissionId)
    {
        SubmissionStorage storage ss = submissionStorage();

        Submission storage submission = ss.submissions[_submissionId];
        submission.contentHash = _contentHash;
        submission.title = _title;
        submission.description = _description;
        submission.timestamp = block.timestamp;

        emit SubmissionUpdated(_submissionId, msg.sender);
    }

    /**
     * @notice Finalize a submission for evaluation
     * @param _submissionId ID of the submission to finalize
     */
    function finalizeSubmission(
        uint256 _submissionId
    )
        external
        submissionExists(_submissionId)
        onlySubmissionAuthor(_submissionId)
        onlyDraft(_submissionId)
    {
        SubmissionStorage storage ss = submissionStorage();

        Submission storage submission = ss.submissions[_submissionId];
        submission.status = SubmissionStatus.Submitted;
        submission.timestamp = block.timestamp;

        emit SubmissionStatusChanged(_submissionId, SubmissionStatus.Submitted);
    }

    /**
     * @notice Evaluate a submission (admin/foundation only)
     * @param _submissionId ID of the submission to evaluate
     * @param _approved Whether the submission is approved
     * @param _score Score assigned to the submission (0-100)
     * @param _feedback Evaluation feedback
     */
    function evaluateSubmission(
        uint256 _submissionId,
        bool _approved,
        uint256 _score,
        string calldata _feedback
    ) external submissionExists(_submissionId) onlyAdminOrFoundation {
        require(
            _score <= 100,
            "SubmissionFacet: Score must be between 0 and 100"
        );

        SubmissionStorage storage ss = submissionStorage();
        Submission storage submission = ss.submissions[_submissionId];

        // Can only evaluate submissions that are in the Submitted state
        require(
            submission.status == SubmissionStatus.Submitted,
            "SubmissionFacet: Submission is not in submitted status"
        );

        // Update submission
        submission.status = _approved
            ? SubmissionStatus.Approved
            : SubmissionStatus.Rejected;
        submission.evaluationScore = _score;
        submission.evaluationFeedback = _feedback;

        emit SubmissionStatusChanged(_submissionId, submission.status);
        emit SubmissionEvaluated(_submissionId, _score);
    }

    /**
     * @notice Purge a submission (admin/foundation only)
     * @param _submissionId ID of the submission to purge
     */
    function purgeSubmission(
        uint256 _submissionId
    ) external submissionExists(_submissionId) onlyAdminOrFoundation {
        SubmissionStorage storage ss = submissionStorage();
        Submission storage submission = ss.submissions[_submissionId];

        // Only rejected submissions can be purged
        require(
            submission.status == SubmissionStatus.Rejected,
            "SubmissionFacet: Only rejected submissions can be purged"
        );

        submission.status = SubmissionStatus.Purged;
        ss.activeSubmissionCount--;

        emit SubmissionStatusChanged(_submissionId, SubmissionStatus.Purged);
    }

    /**
     * @notice Blacklist an author (admin/foundation only)
     * @param _author Address of the author to blacklist
     */
    function blacklistAuthor(address _author) external onlyAdminOrFoundation {
        SubmissionStorage storage ss = submissionStorage();
        ss.blacklistedAuthors[_author] = true;

        emit AuthorBlacklisted(_author);
    }

    /**
     * @notice Get a submission by ID
     * @param _submissionId ID of the submission to retrieve
     * @return Submission data
     */
    function getSubmission(
        uint256 _submissionId
    )
        external
        view
        submissionExists(_submissionId)
        returns (
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
    {
        SubmissionStorage storage ss = submissionStorage();
        Submission storage submission = ss.submissions[_submissionId];

        return (
            submission.id,
            submission.author,
            submission.contentHash,
            submission.title,
            submission.description,
            submission.timestamp,
            submission.status,
            submission.evaluationScore,
            submission.evaluationFeedback
        );
    }

    /**
     * @notice Get all submissions by an author
     * @param _author Address of the author
     * @return Array of submission IDs
     */
    function getAuthorSubmissions(
        address _author
    ) external view returns (uint256[] memory) {
        SubmissionStorage storage ss = submissionStorage();
        return ss.authorSubmissions[_author];
    }

    /**
     * @notice Check if an author is blacklisted
     * @param _author Address of the author
     * @return True if the author is blacklisted
     */
    function isAuthorBlacklisted(address _author) external view returns (bool) {
        SubmissionStorage storage ss = submissionStorage();
        return ss.blacklistedAuthors[_author];
    }

    /**
     * @notice Get total count of active submissions
     * @return Count of active submissions
     */
    function getActiveSubmissionCount() external view returns (uint256) {
        SubmissionStorage storage ss = submissionStorage();
        return ss.activeSubmissionCount;
    }
}

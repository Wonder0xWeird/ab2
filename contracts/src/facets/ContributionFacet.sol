// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/LibDiamond.sol";

/**
 * @title ContributionFacet
 * @dev Manages contributions to ABSTRACTU through the ACRONTU evaluation system
 * @author ABSTRACTU & Claude-3.7-Sonnet
 */
// Version: 1.0.0
contract ContributionFacet {
    /**
     * @dev Contribution status constants
     * Using uint8 instead of enum for better extensibility
     */
    uint8 constant STATUS_INITIALIZED = 1;
    uint8 constant STATUS_ACCEPTED = 2;
    uint8 constant STATUS_REJECTED = 3;
    // Future statuses can be added (4, 5, etc.) without breaking existing logic

    /**
     * @dev Contribution structure
     */
    struct Contribution {
        uint256 id; // Unique contribution ID
        address contributor; // Address of the contributor
        string contentHash; // Filecoin CID (only set when accepted)
        string title; // Title of the contribution
        string description; // Brief description
        uint8 status; // Current status (using constants above)
        uint256 evaluationScore; // Score assigned during evaluation (0-100)
        uint256 timestamp; // Time of last status change
        uint16 version; // Version of the contribution structure
    }

    /**
     * @dev Storage structure for this facet
     */
    struct ContributionStorage {
        // Mapping from contribution ID to Contribution
        mapping(uint256 => Contribution) contributions;
        // Mapping from contributor address to their contribution IDs
        mapping(address => uint256[]) contributorContributions;
        // Counter for generating unique contribution IDs
        uint256 contributionCounter;
        // Total count of all contributions
        uint256 totalContributions;
        // Total count of accepted contributions
        uint256 acceptedContributions;
        // Configuration parameters
        uint256 acceptanceThreshold; // Minimum score for acceptance (default 88)
        uint256 blacklistThreshold; // Maximum score for blacklisting (default 12)
        // Facet version for future migrations
        uint16 facetVersion;
    }

    /**
     * @dev Storage position for the contribution storage
     */
    bytes32 constant CONTRIBUTION_STORAGE_POSITION =
        keccak256("abstractu.contribution.storage");

    /**
     * @dev Get contribution storage
     */
    function contributionStorage()
        internal
        pure
        returns (ContributionStorage storage cs)
    {
        bytes32 position = CONTRIBUTION_STORAGE_POSITION;
        assembly {
            cs.slot := position
        }
    }

    /**
     * @dev Events
     */
    event ContributionInitialized(
        uint256 indexed contributionId,
        address indexed contributor,
        string title,
        string description,
        uint256 timestamp
    );

    event ContributionAccepted(
        uint256 indexed contributionId,
        address indexed contributor,
        string contentHash,
        string title,
        string description,
        uint256 evaluationScore,
        uint256 timestamp
    );

    event ContributionRejected(
        uint256 indexed contributionId,
        address indexed contributor,
        uint256 evaluationScore,
        uint256 timestamp
    );

    event ConfigurationUpdated(
        uint256 acceptanceThreshold,
        uint256 blacklistThreshold,
        uint256 timestamp
    );

    /**
     * @dev Modifiers
     */
    modifier contributionExists(uint256 _contributionId) {
        ContributionStorage storage cs = contributionStorage();
        require(
            cs.contributions[_contributionId].contributor != address(0),
            "ContributionFacet: Contribution does not exist"
        );
        _;
    }

    modifier onlyACRONTU() {
        // For now, only contract owner can act as ACRONTU
        // In the future, this will use the IdentityFacet for verification
        LibDiamond.enforceIsContractOwner();
        _;
    }

    /**
     * @notice Initialize the ContributionFacet configuration
     * @dev Called once when this facet is added to the diamond
     * @param _acceptanceThreshold Minimum score for acceptance (default 88)
     * @param _blacklistThreshold Maximum score for blacklisting (default 12)
     */
    function initializeFacet(
        uint256 _acceptanceThreshold,
        uint256 _blacklistThreshold
    ) external onlyACRONTU {
        ContributionStorage storage cs = contributionStorage();

        // Only initialize if not already initialized
        if (cs.facetVersion == 0) {
            cs.acceptanceThreshold = _acceptanceThreshold > 0
                ? _acceptanceThreshold
                : 88;
            cs.blacklistThreshold = _blacklistThreshold > 0
                ? _blacklistThreshold
                : 12;
            cs.facetVersion = 1; // Set initial version

            emit ConfigurationUpdated(
                cs.acceptanceThreshold,
                cs.blacklistThreshold,
                block.timestamp
            );
        }
    }

    /**
     * @notice Update configuration parameters
     * @param _acceptanceThreshold New minimum score for acceptance
     * @param _blacklistThreshold New maximum score for blacklisting
     */
    function updateConfiguration(
        uint256 _acceptanceThreshold,
        uint256 _blacklistThreshold
    ) external onlyACRONTU {
        require(
            _acceptanceThreshold > 0 && _acceptanceThreshold <= 100,
            "ContributionFacet: Invalid acceptance threshold"
        );
        require(
            _blacklistThreshold < _acceptanceThreshold,
            "ContributionFacet: Blacklist threshold must be less than acceptance threshold"
        );

        ContributionStorage storage cs = contributionStorage();
        cs.acceptanceThreshold = _acceptanceThreshold;
        cs.blacklistThreshold = _blacklistThreshold;

        emit ConfigurationUpdated(
            _acceptanceThreshold,
            _blacklistThreshold,
            block.timestamp
        );
    }

    /**
     * @notice Initialize a new contribution, called by the contributor
     * @param _title Title of the contribution
     * @param _description Brief description of the contribution
     * @return contributionId The ID of the initialized contribution
     */
    function initializeContribution(
        string calldata _title,
        string calldata _description
    ) external returns (uint256) {
        require(
            bytes(_title).length > 0,
            "ContributionFacet: Title cannot be empty"
        );
        require(
            bytes(_description).length > 0,
            "ContributionFacet: Description cannot be empty"
        );

        ContributionStorage storage cs = contributionStorage();

        // Increment contribution counter
        cs.contributionCounter++;
        uint256 newContributionId = cs.contributionCounter;

        // Create new contribution record
        Contribution storage newContribution = cs.contributions[
            newContributionId
        ];
        newContribution.id = newContributionId;
        newContribution.contributor = msg.sender;
        newContribution.title = _title;
        newContribution.description = _description;
        newContribution.status = STATUS_INITIALIZED;
        newContribution.timestamp = block.timestamp;
        newContribution.version = 1; // Set initial version

        // Add to contributor's contributions
        cs.contributorContributions[msg.sender].push(newContributionId);
        cs.totalContributions++;

        // Emit event with all relevant data
        emit ContributionInitialized(
            newContributionId,
            msg.sender,
            _title,
            _description,
            block.timestamp
        );

        return newContributionId;
    }

    /**
     * @notice Accept a contribution after ACRONTU evaluation
     * @param _contributionId ID of the contribution to accept
     * @param _contentHash Filecoin CID of the encrypted content
     * @param _evaluationScore Score assigned during evaluation (0-100)
     */
    function accept(
        uint256 _contributionId,
        string calldata _contentHash,
        uint256 _evaluationScore
    ) external contributionExists(_contributionId) onlyACRONTU {
        ContributionStorage storage cs = contributionStorage();

        require(
            _evaluationScore >= cs.acceptanceThreshold &&
                _evaluationScore <= 100,
            "ContributionFacet: Score must be above acceptance threshold"
        );
        require(
            bytes(_contentHash).length > 0,
            "ContributionFacet: Content hash cannot be empty"
        );

        Contribution storage contribution = cs.contributions[_contributionId];

        // Verify contribution is in the initialized state
        require(
            contribution.status == STATUS_INITIALIZED,
            "ContributionFacet: Contribution is not in initialized status"
        );

        // Update contribution
        contribution.status = STATUS_ACCEPTED;
        contribution.evaluationScore = _evaluationScore;
        contribution.contentHash = _contentHash;
        contribution.timestamp = block.timestamp;
        cs.acceptedContributions++;

        // Emit event with all contribution data
        emit ContributionAccepted(
            _contributionId,
            contribution.contributor,
            _contentHash,
            contribution.title,
            contribution.description,
            _evaluationScore,
            block.timestamp
        );
    }

    /**
     * @notice Reject a contribution after ACRONTU evaluation
     * @param _contributionId ID of the contribution to reject
     * @param _evaluationScore Score assigned during evaluation (0-100)
     */
    function reject(
        uint256 _contributionId,
        uint256 _evaluationScore
    ) external contributionExists(_contributionId) onlyACRONTU {
        ContributionStorage storage cs = contributionStorage();

        require(
            _evaluationScore < cs.acceptanceThreshold,
            "ContributionFacet: Score must be below acceptance threshold for rejection"
        );

        Contribution storage contribution = cs.contributions[_contributionId];

        // Verify contribution is in the initialized state
        require(
            contribution.status == STATUS_INITIALIZED,
            "ContributionFacet: Contribution is not in initialized status"
        );

        // Update contribution
        contribution.status = STATUS_REJECTED;
        contribution.evaluationScore = _evaluationScore;
        contribution.timestamp = block.timestamp;

        // Emit event with relevant data
        emit ContributionRejected(
            _contributionId,
            contribution.contributor,
            _evaluationScore,
            block.timestamp
        );
    }

    /**
     * @notice Get a contribution by ID
     * @param _contributionId ID of the contribution to retrieve
     * @return id Contribution ID
     * @return contributor Address of the contributor
     * @return contentHash Filecoin CID of the content (if accepted)
     * @return title Title of the contribution
     * @return description Brief description
     * @return status Current status code
     * @return evaluationScore Evaluation score
     * @return timestamp Time of last status change
     * @return version Version of the contribution structure
     */
    function getContribution(
        uint256 _contributionId
    )
        external
        view
        contributionExists(_contributionId)
        returns (
            uint256 id,
            address contributor,
            string memory contentHash,
            string memory title,
            string memory description,
            uint8 status,
            uint256 evaluationScore,
            uint256 timestamp,
            uint16 version
        )
    {
        ContributionStorage storage cs = contributionStorage();
        Contribution storage contribution = cs.contributions[_contributionId];

        return (
            contribution.id,
            contribution.contributor,
            contribution.contentHash,
            contribution.title,
            contribution.description,
            contribution.status,
            contribution.evaluationScore,
            contribution.timestamp,
            contribution.version
        );
    }

    /**
     * @notice Get contribution configuration values
     * @return acceptanceThreshold Minimum score for acceptance
     * @return blacklistThreshold Maximum score for blacklisting
     * @return facetVersion Current version of this facet
     */
    function getConfiguration()
        external
        view
        returns (
            uint256 acceptanceThreshold,
            uint256 blacklistThreshold,
            uint16 facetVersion
        )
    {
        ContributionStorage storage cs = contributionStorage();
        return (cs.acceptanceThreshold, cs.blacklistThreshold, cs.facetVersion);
    }

    /**
     * @notice Get all contributions by a contributor
     * @param _contributor Address of the contributor
     * @return Array of contribution IDs
     */
    function getContributorContributions(
        address _contributor
    ) external view returns (uint256[] memory) {
        ContributionStorage storage cs = contributionStorage();
        return cs.contributorContributions[_contributor];
    }

    /**
     * @notice Get count of total contributions
     * @return Count of total contributions
     */
    function getTotalContributions() external view returns (uint256) {
        ContributionStorage storage cs = contributionStorage();
        return cs.totalContributions;
    }

    /**
     * @notice Get count of accepted contributions
     * @return Count of accepted contributions
     */
    function getAcceptedContributions() external view returns (uint256) {
        ContributionStorage storage cs = contributionStorage();
        return cs.acceptedContributions;
    }

    /**
     * @notice Helper function to check if a score meets the acceptance threshold
     * @param _score The evaluation score to check
     * @return True if the score meets or exceeds the acceptance threshold
     */
    function meetsAcceptanceThreshold(
        uint256 _score
    ) external view returns (bool) {
        ContributionStorage storage cs = contributionStorage();
        return _score >= cs.acceptanceThreshold;
    }

    /**
     * @notice Helper function to check if a score is below the blacklist threshold
     * @param _score The evaluation score to check
     * @return True if the score is at or below the blacklist threshold
     */
    function isBelowBlacklistThreshold(
        uint256 _score
    ) external view returns (bool) {
        ContributionStorage storage cs = contributionStorage();
        return _score <= cs.blacklistThreshold;
    }
}

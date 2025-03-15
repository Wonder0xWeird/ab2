// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDiamondCut
 * @dev Interface for the diamond cut functionality as defined in EIP-2535
 * @notice Manages adding/replacing/removing functions in the Diamond
 */
interface IDiamondCut {
    // Enum defining the actions that can be performed on a facet
    enum FacetCutAction {
        Add, // 0 = Add functions from facet
        Replace, // 1 = Replace functions from facet
        Remove // 2 = Remove functions from facet
    }

    // Struct defining a facet and its associated function selectors
    struct FacetCut {
        address facetAddress; // Address of the facet contract
        FacetCutAction action; // Action to perform (Add, Replace, Remove)
        bytes4[] functionSelectors; // List of function selectors
    }

    /**
     * @notice Add, replace, or remove facet functions
     * @dev If the action is Remove, the facetAddress should be address(0)
     * @param _diamondCut Array of FacetCut structs defining the changes
     * @param _init Address of the initialization contract (or address(0) if not initializing)
     * @param _calldata Calldata to pass to the _init contract
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    /**
     * @dev Event emitted when a diamond cut is executed
     * @param _diamondCut Array of FacetCut structs defining the changes
     * @param _init Address of the initialization contract
     * @param _calldata Calldata passed to the _init contract
     */
    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}

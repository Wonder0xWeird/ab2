// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

/**
 * @title DiamondCutFacet
 * @dev Implementation of the IDiamondCut interface
 * @notice Manages adding/replacing/removing functions in the Diamond
 * @author ABSTRACTU & Claude-3.7-Sonnet (based on EIP-2535 reference implementation)
 */
contract DiamondCutFacet is IDiamondCut {
    /**
     * @notice Add, replace, or remove facet functions
     * @dev If the action is Remove, the facetAddress should be address(0)
     * @param _diamondCut Array of FacetCut structs defining the changes
     * @param _init Address of the initialization contract
     * @param _calldata Calldata to pass to the _init contract
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        // Only contract owner can cut the diamond
        LibDiamond.enforceIsContractOwner();

        // Perform the diamond cut
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}

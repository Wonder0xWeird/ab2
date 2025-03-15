// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IDiamondLoupe} from "../interfaces/IDiamondLoupe.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

/**
 * @title DiamondLoupeFacet
 * @dev Implementation of the IDiamondLoupe interface
 * @notice Provides introspection functions for the Diamond
 * @author ABSTRACTU & Claude-3.7-Sonnet (based on EIP-2535 reference implementation)
 */
contract DiamondLoupeFacet is IDiamondLoupe, IERC165 {
    /**
     * @notice Get all facet addresses used by the diamond
     * @return facetAddresses_ Array of facet addresses
     */
    function facetAddresses()
        external
        view
        override
        returns (address[] memory facetAddresses_)
    {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        // Create a set of unique facet addresses
        // First, count the unique facet addresses
        uint256 count = 0;
        address[] memory uniqueFacets = new address[](
            ds.functionSelectors.length
        );

        for (uint256 i = 0; i < ds.functionSelectors.length; i++) {
            address facet = ds
                .selectorToFacetAndPosition[ds.functionSelectors[i]]
                .facetAddress;
            bool found = false;

            for (uint256 j = 0; j < count; j++) {
                if (uniqueFacets[j] == facet) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                uniqueFacets[count] = facet;
                count++;
            }
        }

        // Create the return array
        facetAddresses_ = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            facetAddresses_[i] = uniqueFacets[i];
        }
    }

    /**
     * @notice Get all facet addresses and their selectors
     * @return facets_ Array of structs containing facet addresses and their selectors
     */
    function facets() external view override returns (Facet[] memory facets_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        // Create a mapping to track facet indices
        uint256 facetCount = 0;
        address[] memory uniqueFacets = new address[](
            ds.functionSelectors.length
        );

        // Count unique facets
        for (uint256 i = 0; i < ds.functionSelectors.length; i++) {
            address facet = ds
                .selectorToFacetAndPosition[ds.functionSelectors[i]]
                .facetAddress;
            bool found = false;

            for (uint256 j = 0; j < facetCount; j++) {
                if (uniqueFacets[j] == facet) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                uniqueFacets[facetCount] = facet;
                facetCount++;
            }
        }

        // Create the return array
        facets_ = new Facet[](facetCount);

        // Initialize facets array
        for (uint256 i = 0; i < facetCount; i++) {
            facets_[i].facetAddress = uniqueFacets[i];
            facets_[i].functionSelectors = ds.facetFunctionSelectors[
                uniqueFacets[i]
            ];
        }
    }

    /**
     * @notice Get all function selectors supported by a specific facet
     * @param _facet The facet address
     * @return facetFunctionSelectors_ Array of function selectors
     */
    function facetFunctionSelectors(
        address _facet
    ) external view override returns (bytes4[] memory facetFunctionSelectors_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetFunctionSelectors_ = ds.facetFunctionSelectors[_facet];
    }

    /**
     * @notice Get the facet address that supports a specific function
     * @param _functionSelector The function selector
     * @return facetAddress_ The facet address
     */
    function facetAddress(
        bytes4 _functionSelector
    ) external view override returns (address facetAddress_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        facetAddress_ = ds
            .selectorToFacetAndPosition[_functionSelector]
            .facetAddress;
    }

    /**
     * @notice ERC165 support
     * @param _interfaceId The interface identifier
     * @return boolean True if the interface is supported
     */
    function supportsInterface(
        bytes4 _interfaceId
    ) external view override returns (bool) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        // Check if the interface is supported by any facet
        return
            _interfaceId == type(IERC165).interfaceId ||
            _interfaceId == type(IDiamondLoupe).interfaceId ||
            ds.selectorToFacetAndPosition[_interfaceId].facetAddress !=
            address(0);
    }
}

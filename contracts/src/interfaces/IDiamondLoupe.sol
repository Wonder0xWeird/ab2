// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDiamondLoupe
 * @dev Interface for diamond loupe functions
 * @notice Diamond loupe functions are for introspection purposes
 */
interface IDiamondLoupe {
    /**
     * @notice Get all facet addresses used by the diamond
     * @return facetAddresses_ Array of facet addresses
     */
    function facetAddresses()
        external
        view
        returns (address[] memory facetAddresses_);

    /**
     * @notice Get all facet addresses and their selectors
     * @return facets_ Array of structs containing facet addresses and their selectors
     */
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    function facets() external view returns (Facet[] memory facets_);

    /**
     * @notice Get all function selectors supported by a specific facet
     * @param _facet The facet address
     * @return facetFunctionSelectors_ Array of function selectors
     */
    function facetFunctionSelectors(
        address _facet
    ) external view returns (bytes4[] memory facetFunctionSelectors_);

    /**
     * @notice Get the facet address that supports a specific function
     * @param _functionSelector The function selector
     * @return facetAddress_ The facet address
     */
    function facetAddress(
        bytes4 _functionSelector
    ) external view returns (address facetAddress_);
}

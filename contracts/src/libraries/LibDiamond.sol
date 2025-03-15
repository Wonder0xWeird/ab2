// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondCut} from "../interfaces/IDiamondCut.sol";

/**
 * @title LibDiamond
 * @dev Library for the core Diamond functionality
 * @notice Contains storage and functions for managing Diamond facets and their function selectors
 * @author ABSTRACTU & Claude-3.7-Sonnet (based on EIP-2535 reference implementation)
 */
library LibDiamond {
    // Storage position in the EVM
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("abstractu.diamond.storage");

    // Event emitted when a diamond cut is executed
    event DiamondCut(
        IDiamondCut.FacetCut[] _diamondCut,
        address _init,
        bytes _calldata
    );

    // Struct to track selector to facet mapping with position information
    struct FacetAddressAndPosition {
        address facetAddress;
        uint16 functionSelectorPosition;
    }

    // Main storage structure for diamond
    struct DiamondStorage {
        // Maps function selectors to their facets and positions
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPosition;
        // Array of all selectors
        bytes4[] functionSelectors;
        // Maps facets to their selectors
        mapping(address => bytes4[]) facetFunctionSelectors;
        // Slot for contract owner
        address contractOwner;
    }

    // Event emitted when a diamond cut is executed
    /**
     * @dev Get the diamond storage slot
     * @return ds The DiamondStorage struct
     */
    function diamondStorage()
        internal
        pure
        returns (DiamondStorage storage ds)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    /**
     * @dev Set the contract owner
     * @param _newOwner The address of the new owner
     */
    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    /**
     * @dev Get the contract owner
     * @return owner The address of the contract owner
     */
    function contractOwner() internal view returns (address owner) {
        owner = diamondStorage().contractOwner;
    }

    /**
     * @dev Enforce that the caller is the contract owner
     */
    function enforceIsContractOwner() internal view {
        require(
            msg.sender == diamondStorage().contractOwner,
            "LibDiamond: Not contract owner"
        );
    }

    /**
     * @dev Event emitted when ownership is transferred
     * @param previousOwner The previous owner
     * @param newOwner The new owner
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Internal implementation of diamondCut
     * @param _diamondCut Array of FacetCut structs defining the changes
     * @param _init Address of the initialization contract
     * @param _calldata Calldata to pass to the _init contract
     */
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal {
        for (
            uint256 facetIndex;
            facetIndex < _diamondCut.length;
            facetIndex++
        ) {
            IDiamondCut.FacetCutAction action = _diamondCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(
                    _diamondCut[facetIndex].facetAddress,
                    _diamondCut[facetIndex].functionSelectors
                );
            } else {
                revert("LibDiamond: Incorrect FacetCutAction");
            }
        }
        emit DiamondCut(_diamondCut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    /**
     * @dev Add functions to the diamond
     * @param _facetAddress The address of the facet contract
     * @param _functionSelectors Array of function selectors to add
     */
    function addFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamond: No selectors provided"
        );
        require(
            _facetAddress != address(0),
            "LibDiamond: Add facet can't be address(0)"
        );

        DiamondStorage storage ds = diamondStorage();

        for (uint256 i; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];

            // Check if function already exists
            address oldFacetAddress = ds
                .selectorToFacetAndPosition[selector]
                .facetAddress;
            require(
                oldFacetAddress == address(0),
                "LibDiamond: Function already exists"
            );

            // Add function
            ds.selectorToFacetAndPosition[selector] = FacetAddressAndPosition(
                _facetAddress,
                uint16(ds.functionSelectors.length)
            );
            ds.functionSelectors.push(selector);
            ds.facetFunctionSelectors[_facetAddress].push(selector);
        }
    }

    /**
     * @dev Replace functions in the diamond
     * @param _facetAddress The address of the new facet contract
     * @param _functionSelectors Array of function selectors to replace
     */
    function replaceFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamond: No selectors provided"
        );
        require(
            _facetAddress != address(0),
            "LibDiamond: Replace facet can't be address(0)"
        );

        DiamondStorage storage ds = diamondStorage();

        for (uint256 i; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];

            // Get the old facet address
            address oldFacetAddress = ds
                .selectorToFacetAndPosition[selector]
                .facetAddress;

            // Can't replace a function that doesn't exist or is from the same facet
            require(
                oldFacetAddress != address(0),
                "LibDiamond: Function doesn't exist"
            );
            require(
                oldFacetAddress != _facetAddress,
                "LibDiamond: Can't replace function with same facet"
            );

            // Replace function
            // Keep the same position, just change the facet address
            ds
                .selectorToFacetAndPosition[selector]
                .facetAddress = _facetAddress;

            // Update facet function selectors
            // Remove from old facet
            bytes4[] storage oldFacetSelectors = ds.facetFunctionSelectors[
                oldFacetAddress
            ];

            // Find and replace the selector in the old facet's selectors
            for (uint256 j; j < oldFacetSelectors.length; j++) {
                if (oldFacetSelectors[j] == selector) {
                    oldFacetSelectors[j] = oldFacetSelectors[
                        oldFacetSelectors.length - 1
                    ];
                    oldFacetSelectors.pop();
                    break;
                }
            }

            // Add to new facet
            ds.facetFunctionSelectors[_facetAddress].push(selector);
        }
    }

    /**
     * @dev Remove functions from the diamond
     * @param _facetAddress The address of the facet (or address(0) for removal)
     * @param _functionSelectors Array of function selectors to remove
     */
    function removeFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(
            _functionSelectors.length > 0,
            "LibDiamond: No selectors provided"
        );

        // For removal, facet address must be 0
        require(
            _facetAddress == address(0),
            "LibDiamond: Remove facet address must be address(0)"
        );

        DiamondStorage storage ds = diamondStorage();

        for (uint256 i; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];

            // Get facet address and position
            FacetAddressAndPosition memory facetAddressAndPosition = ds
                .selectorToFacetAndPosition[selector];

            // Ensure function exists
            address oldFacetAddress = facetAddressAndPosition.facetAddress;
            require(
                oldFacetAddress != address(0),
                "LibDiamond: Function doesn't exist"
            );

            // Get position in the function selectors array
            uint256 selectorPosition = facetAddressAndPosition
                .functionSelectorPosition;

            // Get last selector in array
            uint256 lastSelectorPosition = ds.functionSelectors.length - 1;

            // Replace the selector being removed with the last selector
            if (selectorPosition != lastSelectorPosition) {
                bytes4 lastSelector = ds.functionSelectors[
                    lastSelectorPosition
                ];
                ds.functionSelectors[selectorPosition] = lastSelector;
                ds
                    .selectorToFacetAndPosition[lastSelector]
                    .functionSelectorPosition = uint16(selectorPosition);
            }

            // Remove the last selector
            ds.functionSelectors.pop();

            // Delete the old selector mapping
            delete ds.selectorToFacetAndPosition[selector];

            // Remove from the old facet's selectors
            bytes4[] storage oldFacetSelectors = ds.facetFunctionSelectors[
                oldFacetAddress
            ];

            // Find and remove the selector
            for (uint256 j; j < oldFacetSelectors.length; j++) {
                if (oldFacetSelectors[j] == selector) {
                    oldFacetSelectors[j] = oldFacetSelectors[
                        oldFacetSelectors.length - 1
                    ];
                    oldFacetSelectors.pop();
                    break;
                }
            }
        }
    }

    /**
     * @dev Initialize the diamond cut if an init contract is provided
     * @param _init Address of the initialization contract
     * @param _calldata Calldata to pass to the _init contract
     */
    function initializeDiamondCut(
        address _init,
        bytes memory _calldata
    ) internal {
        if (_init == address(0)) {
            return;
        }

        require(_calldata.length > 0, "LibDiamond: _calldata is empty");

        // Call the init function
        (bool success, bytes memory error) = _init.delegatecall(_calldata);

        // Check if the call was successful
        if (!success) {
            // If error data is returned, revert with that error
            if (error.length > 0) {
                assembly {
                    let returndata_size := mload(error)
                    revert(add(32, error), returndata_size)
                }
            } else {
                revert("LibDiamond: Function reverted");
            }
        }
    }
}

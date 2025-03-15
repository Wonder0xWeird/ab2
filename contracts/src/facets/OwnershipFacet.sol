// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC173} from "../interfaces/IERC173.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

/**
 * @title OwnershipFacet
 * @dev Implementation of the IERC173 interface
 * @notice Provides functions for managing contract ownership
 * @author ABSTRACTU & Claude-3.7-Sonnet (based on EIP-2535 reference implementation)
 */
contract OwnershipFacet is IERC173 {
    /**
     * @notice Get the address of the contract owner
     * @return owner_ The address of the owner
     */
    function owner() external view override returns (address owner_) {
        owner_ = LibDiamond.contractOwner();
    }

    /**
     * @notice Transfer ownership of the contract to a new address
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external override {
        // Only the current owner can transfer ownership
        LibDiamond.enforceIsContractOwner();

        // Cannot transfer ownership to the zero address
        require(
            _newOwner != address(0),
            "OwnershipFacet: New owner cannot be the zero address"
        );

        // Transfer ownership
        LibDiamond.setContractOwner(_newOwner);
    }
}

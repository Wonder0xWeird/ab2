// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC173
 * @dev Contract ownership standard interface (ERC173)
 * @notice Provides a standard interface for contract ownership
 */
interface IERC173 {
    /**
     * @notice Get the address of the contract owner
     * @return owner_ The address of the owner
     */
    function owner() external view returns (address owner_);

    /**
     * @notice Transfer ownership of the contract to a new address
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external;

    /**
     * @dev Event emitted when ownership is transferred
     * @param previousOwner The previous owner
     * @param newOwner The new owner
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";

/**
 * @title TestFacet
 * @dev A simple facet for testing diamond cut functionality
 */
contract TestFacet {
    // Storage structure for this facet
    struct TestStorage {
        uint256 value;
        string message;
    }

    // Returns the position in storage for TestStorage
    function testStorage() internal pure returns (TestStorage storage ts) {
        bytes32 position = keccak256("test.facet.storage");
        assembly {
            ts.slot := position
        }
    }

    /**
     * @dev Sets a value in the TestStorage
     * @param _value The value to store
     */
    function setValue(uint256 _value) external {
        TestStorage storage ts = testStorage();
        ts.value = _value;
    }

    /**
     * @dev Gets the stored value
     * @return The stored value
     */
    function getValue() external view returns (uint256) {
        TestStorage storage ts = testStorage();
        return ts.value;
    }

    /**
     * @dev Sets a message in the TestStorage
     * @param _message The message to store
     */
    function setMessage(string calldata _message) external {
        TestStorage storage ts = testStorage();
        ts.message = _message;
    }

    /**
     * @dev Gets the stored message
     * @return The stored message
     */
    function getMessage() external view returns (string memory) {
        TestStorage storage ts = testStorage();
        return ts.message;
    }

    /**
     * @dev A function that requires the caller to be the contract owner
     * @param _value The value to store
     */
    function setValueAsOwner(uint256 _value) external {
        LibDiamond.enforceIsContractOwner();
        TestStorage storage ts = testStorage();
        ts.value = _value;
    }
}

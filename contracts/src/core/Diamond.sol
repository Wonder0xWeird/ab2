// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";

/**
 * @title Diamond
 * @dev This is the main Diamond contract that implements EIP-2535 Diamond Standard
 * @notice It is the core entry point for all function calls to the ABSTRACTU system
 * @author ABSTRACTU & Claude-3.7-Sonnet
 */
contract Diamond {
    // Define storage variable for the deployment version
    string constant public VERSION = "0.1.0";

    /**
     * @dev Constructor called once during deployment
     * @param _contractOwner The address that will own the diamond
     * @param _diamondCutFacet The address of the DiamondCutFacet, which handles adding/replacing/removing functions
     */
    constructor(
        address _contractOwner,
        address _diamondCutFacet
    ) payable {
        // Initialize contract ownership
        LibDiamond.setContractOwner(_contractOwner);

        // Add the diamondCut external function from the diamondCutFacet
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCut.diamondCut.selector;
        
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _diamondCutFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: functionSelectors
        });
        
        LibDiamond.diamondCut(cut, address(0), new bytes(0));

        // Emit deployment event
        emit DiamondDeployed(VERSION, _contractOwner);
    }

    /**
     * @dev This event is emitted when the Diamond is deployed
     * @param version The version of the Diamond implementation
     * @param owner The initial owner of the Diamond
     */
    event DiamondDeployed(string version, address indexed owner);

    /**
     * @dev Diamond fallback function
     * @notice This function is called for all function calls not handled by other functions
     */
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        
        // Get facet from function selector
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        
        // If facet is not found, revert
        require(facet != address(0), "Diamond: Function does not exist");
        
        // Execute external function from facet using delegatecall
        assembly {
            // Copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            
            // Execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            
            // Get any return data
            returndatacopy(0, 0, returndatasize())
            
            // Return any return data
            switch result
            case 0 {
                // Revert if the call fails
                revert(0, returndatasize())
            }
            default {
                // Return with the data if the call succeeds
                return(0, returndatasize())
            }
        }
    }

    /**
     * @dev Receive function to allow receiving ETH
     */
    receive() external payable {
        // Emit event when ETH is received
        emit EthReceived(msg.sender, msg.value);
    }

    /**
     * @dev Event emitted when ETH is received
     * @param sender The sender of the ETH
     * @param amount The amount of ETH received
     */
    event EthReceived(address indexed sender, uint256 amount);
} 
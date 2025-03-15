/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract } from "ethers";

export enum FacetCutAction {
  Add = 0,
  Replace = 1,
  Remove = 2
}

// Helper function to get function selectors from an ABI
export function getSelectors(contract: Contract | any): string[] {
  const signatures: string[] = Object.keys(contract.interface.fragments)
    .filter(key => contract.interface.fragments[key].type === 'function')
    .map(key => {
      return contract.interface.fragments[key].format();
    });

  return signatures.map(sig => {
    return contract.interface.getFunction(sig)!.selector;
  });
}

// Helper function to remove selectors from an array of selectors
export function removeSelectors(selectors: string[], removeSelectors: string[]): string[] {
  return selectors.filter(selector => !removeSelectors.includes(selector));
}

// Helper function to find the position of a selector in an array of selectors
export function findPositionInSelectors(selectors: string[], selector: string): number {
  return selectors.findIndex(s => s === selector);
}

// Helper function to convert hex selectors to readible strings
export function convertSelectorsToHex(selectors: string[]): string[] {
  return selectors.map(selector => `0x${selector.slice(2)}`);
}

// Helper function to get function signatures from an ABI
export function getSignatures(contract: Contract): string[] {
  return Object.values(contract.interface.fragments)
    .filter(fragment => fragment.type === 'function')
    .map(fragment => fragment.format());
}

// Helper function to get a function selector from a signature
export function getSelector(functionSignature: string, contract: Contract): string {
  return contract.interface.getFunction(functionSignature)!.selector;
} 
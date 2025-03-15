# Diamond Standard Implementation (EIP-2535)

This project implements the Diamond Standard (EIP-2535) for creating upgradeable smart contracts on Ethereum. The Diamond pattern allows for modular smart contract development, where functionality can be added, replaced, or removed without redeploying the entire contract.

## Overview

The Diamond Standard provides several key benefits:
- **Unlimited Contract Size**: Overcome the 24KB contract size limit
- **Upgradability**: Add, replace, or remove functionality
- **Modularity**: Organize code into facets (modules)
- **Gas Efficiency**: Only deploy the code that changes

## Project Structure

```
contracts/
├── src/
│   ├── core/
│   │   └── Diamond.sol         # Main Diamond contract
│   ├── facets/
│   │   ├── DiamondCutFacet.sol # Handles diamond cuts (upgrades)
│   │   ├── DiamondLoupeFacet.sol # Provides introspection
│   │   ├── OwnershipFacet.sol  # Manages ownership
│   │   └── TestFacet.sol       # Example facet for testing
│   ├── interfaces/
│   │   ├── IDiamondCut.sol     # Interface for diamond cuts
│   │   ├── IDiamondLoupe.sol   # Interface for introspection
│   │   └── IERC173.sol         # Interface for ownership
│   └── libraries/
│       └── LibDiamond.sol      # Core diamond functionality
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── libraries/
│       └── diamond.ts          # Helper functions for deployment
└── test/
    └── Diamond.test.ts         # Tests for the diamond implementation
```

## Key Components

1. **Diamond.sol**: The main contract that delegates calls to facets
2. **DiamondCutFacet.sol**: Manages adding, replacing, and removing facets
3. **DiamondLoupeFacet.sol**: Provides introspection capabilities
4. **OwnershipFacet.sol**: Manages contract ownership
5. **LibDiamond.sol**: Core library with diamond storage and functionality

## Getting Started

### Prerequisites

- Node.js and npm
- Hardhat

### Installation

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

## How to Use

### Adding a New Facet

1. Create a new facet contract in the `src/facets` directory
2. Deploy the facet
3. Use the DiamondCutFacet to add the facet to your diamond

Example:
```solidity
// Deploy your facet
MyNewFacet myNewFacet = new MyNewFacet();

// Get function selectors
bytes4[] memory selectors = getSelectors(myNewFacet);

// Add facet to diamond
diamondCut.diamondCut(
    [{
        facetAddress: address(myNewFacet),
        action: FacetCutAction.Add,
        functionSelectors: selectors
    }],
    address(0),
    ""
);
```

### Replacing a Facet

Similar to adding, but use `FacetCutAction.Replace` instead.

### Removing a Facet

Use `FacetCutAction.Remove` and set the facet address to the zero address.

## Resources

- [EIP-2535: Diamonds, Multi-Facet Proxy](https://eips.ethereum.org/EIPS/eip-2535)
- [Diamond Standard Reference Implementation](https://github.com/mudgen/diamond-3)
- [Diamond Standard Documentation](https://eip2535diamonds.substack.com/)

## License

MIT 
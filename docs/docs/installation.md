---
sidebar_position: 2
---

# Installation Guide

This guide will help you set up your local development environment for the ABSTRACTU platform, whether you're working on the smart contracts, frontend, or both.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or later) and npm
- [Git](https://git-scm.com/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation.html) (for smart contract development and testing)
- [MetaMask](https://metamask.io/) or another Ethereum wallet

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abstractu/ab2.git
cd ab2
```

### 2. Install Dependencies

The project is organized into separate packages for smart contracts and frontend:

#### Smart Contracts

```bash
cd contracts
npm install
```

#### Frontend

```bash
cd ../app
npm install
```

### 3. Set Up Environment Variables

#### For Smart Contracts

Create a `.env` file in the `contracts` directory:

```
# Copy from .env.example
cp .env.example .env
```

Then edit the `.env` file to add:

```
PRIVATE_KEY=your_private_key_for_deployment
ABSTRACT_RPC_URL=abstract_network_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
ABSTRACT_ARCHIVE_RPC_URL=your_archive_node_url
ENABLE_FORKING=true
FORK_BLOCK_NUMBER=optional_specific_block_number
```

#### For Frontend

Create a `.env.local` file in the `app` directory:

```
# Copy from .env.example
cp .env.example .env.local
```

Edit the file to add:

```
NEXT_PUBLIC_DIAMOND_ADDRESS=your_diamond_contract_address
NEXT_PUBLIC_CHAIN_ID=abstract_chain_id
NEXT_PUBLIC_RPC_URL=abstract_network_rpc_url
```

## Smart Contract Development

### Running Tests

To run the smart contract tests:

```bash
cd contracts
npx hardhat test
```

### Local Deployment

To deploy the contracts to a local Hardhat network:

```bash
cd contracts
npx hardhat node
```

In a separate terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Forking Abstract Blockchain

To run a local dev environment with a forked version of the Abstract blockchain:

```bash
cd contracts
npm run devnet-abstractFork
```

## Frontend Development

### Running the Development Server

```bash
cd app
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the frontend for production:

```bash
cd app
npm run build
```

## Documentation Development

This documentation is built using Docusaurus. To run the documentation locally:

```bash
cd docs
npm install
npm start
```

The documentation will be available at [http://localhost:3000](http://localhost:3000).

To build the documentation:

```bash
cd docs
npm run build
```

## Folder Structure

The project is organized into the following directories:

```
ab2/
├── app/               # Frontend application (Next.js)
├── contracts/         # Smart contracts (Solidity)
│   ├── scripts/       # Deployment scripts
│   ├── src/           # Contract source code
│   └── test/          # Contract tests
└── docs/              # Documentation (Docusaurus)
```

## Troubleshooting

### Common Issues

#### Contract Deployment Failures

- Ensure your wallet has enough funds for deployment
- Verify network configurations in `hardhat.config.ts`
- Check that your `.env` file contains the correct environment variables

#### Frontend Connection Issues

- Confirm that the contract addresses in your `.env.local` file are correct
- Ensure your MetaMask is connected to the correct network
- Check browser console for any JavaScript errors

#### Test Failures

- Make sure all dependencies are installed
- Verify Hardhat configuration
- Check that your environment variables are set correctly

## Next Steps

After setting up your development environment:

1. Explore the [Architecture Overview](./architecture.md) to understand the system design
2. Read about the [Diamond Standard](./core-concepts/diamond-standard.md) implementation
3. Learn about the [Submission Process](./core-concepts/submissions.md) for content creators
4. Check out the [Smart Contracts Documentation](./smart-contracts/overview.md) for details on the contract architecture 
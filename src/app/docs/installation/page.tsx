'use client';

import Link from 'next/link';

export default function InstallationPage() {
  return (
    <div className="docs-page">
      <h1>Installation Guide</h1>

      <p>
        This guide will help you set up your local development environment for the ABSTRACTU platform,
        whether you&apos;re working on the smart contracts, frontend, or both.
      </p>

      <h2>Prerequisites</h2>

      <p>Before you begin, ensure you have the following installed:</p>

      <ul>
        <li>
          <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a>
          (v16.x or later) and npm
        </li>
        <li>
          <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">Git</a>
        </li>
        <li>
          <a href="https://book.getfoundry.sh/getting-started/installation.html" target="_blank" rel="noopener noreferrer">
            Foundry
          </a> (for smart contract development and testing)
        </li>
        <li>
          <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</a>
          or another Ethereum wallet
        </li>
      </ul>

      <h2>Environment Setup</h2>

      <h3>1. Clone the Repository</h3>

      <pre><code>{`git clone https://github.com/abstractu/ab2.git
cd ab2`}</code></pre>

      <h3>2. Install Dependencies</h3>

      <p>The project is organized into separate packages for smart contracts and frontend:</p>

      <h4>Smart Contracts</h4>

      <pre><code>{`cd contracts
npm install`}</code></pre>

      <h4>Frontend</h4>

      <pre><code>{`cd ../app
npm install`}</code></pre>

      <h3>3. Set Up Environment Variables</h3>

      <h4>For Smart Contracts</h4>

      <p>Create a <code>.env</code> file in the <code>contracts</code> directory:</p>

      <pre><code>{`# Copy from .env.example
cp .env.example .env`}</code></pre>

      <p>Then edit the <code>.env</code> file to add:</p>

      <pre><code>{`PRIVATE_KEY=your_private_key_for_deployment
ABSTRACT_RPC_URL=abstract_network_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
ABSTRACT_ARCHIVE_RPC_URL=your_archive_node_url
ENABLE_FORKING=true
FORK_BLOCK_NUMBER=optional_specific_block_number`}</code></pre>

      <h4>For Frontend</h4>

      <p>Create a <code>.env.local</code> file in the <code>app</code> directory:</p>

      <pre><code>{`# Copy from .env.example
cp .env.example .env.local`}</code></pre>

      <p>Edit the file to add:</p>

      <pre><code>{`NEXT_PUBLIC_DIAMOND_ADDRESS=your_diamond_contract_address
NEXT_PUBLIC_CHAIN_ID=abstract_chain_id
NEXT_PUBLIC_RPC_URL=abstract_network_rpc_url`}</code></pre>

      <h2>Smart Contract Development</h2>

      <h3>Running Tests</h3>

      <p>To run the smart contract tests:</p>

      <pre><code>{`cd contracts
npx hardhat test`}</code></pre>

      <h3>Local Deployment</h3>

      <p>To deploy the contracts to a local Hardhat network:</p>

      <pre><code>{`cd contracts
npx hardhat node`}</code></pre>

      <p>In a separate terminal:</p>

      <pre><code>{`cd contracts
npx hardhat run scripts/deploy.ts --network localhost`}</code></pre>

      <h3>Forking Abstract Blockchain</h3>

      <p>To run a local dev environment with a forked version of the Abstract blockchain:</p>

      <pre><code>{`cd contracts
npm run devnet-abstractFork`}</code></pre>

      <h2>Frontend Development</h2>

      <h3>Running the Development Server</h3>

      <pre><code>{`cd app
npm run dev`}</code></pre>

      <p>The frontend will be available at <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">http://localhost:3000</a>.</p>

      <h3>Building for Production</h3>

      <p>To build the frontend for production:</p>

      <pre><code>{`cd app
npm run build`}</code></pre>

      <h2>Folder Structure</h2>

      <p>The project is organized into the following directories:</p>

      <pre><code>{`ab2/
├── app/               # Frontend application (Next.js)
├── contracts/         # Smart contracts (Solidity)
│   ├── scripts/       # Deployment scripts
│   ├── src/           # Contract source code
│   └── test/          # Contract tests
└── docs/              # Documentation files`}</code></pre>

      <h2>Troubleshooting</h2>

      <h3>Common Issues</h3>

      <h4>Contract Deployment Failures</h4>

      <ul>
        <li>Ensure your wallet has enough funds for deployment</li>
        <li>Verify network configurations in <code>hardhat.config.ts</code></li>
        <li>Check that your <code>.env</code> file contains the correct environment variables</li>
      </ul>

      <h4>Frontend Connection Issues</h4>

      <ul>
        <li>
          Confirm that the contract addresses in your <code>.env.local</code> file are correct
        </li>
        <li>Ensure your MetaMask is connected to the correct network</li>
        <li>Check browser console for any JavaScript errors</li>
      </ul>

      <h4>Test Failures</h4>

      <ul>
        <li>Make sure all dependencies are installed</li>
        <li>Verify Hardhat configuration</li>
        <li>Check that your environment variables are set correctly</li>
      </ul>

      <h2>Next Steps</h2>

      <p>After setting up your development environment:</p>

      <ol>
        <li>
          Explore the <Link href="/docs/architecture">Architecture Overview</Link> to understand the system design
        </li>
        <li>
          Read about the <Link href="/docs/core-concepts/diamond-standard">Diamond Standard</Link> implementation
        </li>
        <li>
          Learn about the <Link href="/docs/core-concepts/submissions">Submission Process</Link> for content creators
        </li>
        <li>
          Check out the <Link href="/docs/smart-contracts/overview">Smart Contracts Documentation</Link> for details on the contract architecture
        </li>
      </ol>
    </div>
  );
} 
'use client';

export default function DiamondStandardPage() {
  return (
    <div className="docs-page">
      <h1>Diamond Standard (EIP-2535)</h1>

      <p>
        The Diamond Standard is a crucial architectural pattern used in the ABSTRACTU platform
        to provide upgradeable, modular smart contracts.
      </p>

      <h2>Overview</h2>

      <p>
        The Diamond Standard (EIP-2535) allows for a contract (called a Diamond) to be composed
        of multiple separate contracts (called Facets). This enables modular functionality and
        contract upgradeability without changing the Diamond&apos;s address or state.
      </p>

      <h2>Key Concepts</h2>

      <h3>Diamond</h3>

      <p>The Diamond is the main contract that users interact with. It:</p>

      <ul>
        <li>Maintains a single address and state storage</li>
        <li>Delegates function calls to appropriate facets</li>
        <li>Provides a central point of interaction for users and other contracts</li>
      </ul>

      <h3>Facets</h3>

      <p>Facets are individual contracts that implement specific functionality:</p>

      <ul>
        <li>Each facet implements a set of related functions</li>
        <li>Facets do not maintain their own storage (they use the Diamond&apos;s storage)</li>
        <li>Facets can be added, replaced, or removed from the Diamond</li>
      </ul>

      <h3>Diamond Cuts</h3>

      <p>
        A &quot;diamond cut&quot; is the process of adding, replacing, or removing facets from a Diamond:
      </p>

      <ul>
        <li>Add: Deploy a new facet and register its functions with the Diamond</li>
        <li>Replace: Deploy a new facet that replaces the functions of an existing facet</li>
        <li>Remove: Unregister functions from the Diamond</li>
      </ul>

      <h3>Function Selectors</h3>

      <p>Function selectors are 4-byte identifiers for each function:</p>

      <ul>
        <li>
          Derived from the first 4 bytes of the keccak256 hash of the function signature
        </li>
        <li>The Diamond uses these selectors to route calls to the appropriate facet</li>
      </ul>

      <h2>ABSTRACTU Implementation</h2>

      <p>
        In the ABSTRACTU platform, we&apos;ve implemented the Diamond Standard with the following components:
      </p>

      <h3>Core Diamond Contract</h3>

      <pre><code>{`// contracts/src/core/Diamond.sol
contract Diamond {
    constructor(address _contractOwner, address _diamondCutFacet) payable {
        // Initialize Diamond storage
        // Set contract owner
        // Register DiamondCutFacet functions
    }
    
    // Fallback function for delegating calls to facets
    fallback() external payable {
        // Find the facet for the function selector
        // Delegate the call to the facet
    }
    
    receive() external payable {}
}`}</code></pre>

      <h3>Core Facets</h3>

      <p>ABSTRACTU implements several core facets required by the Diamond Standard:</p>

      <ol>
        <li><strong>DiamondCutFacet</strong>: Manages adding, replacing, and removing facets</li>
        <li>
          <strong>DiamondLoupeFacet</strong>: Provides introspection functions to query facets and function selectors
        </li>
        <li><strong>OwnershipFacet</strong>: Manages ownership of the Diamond</li>
      </ol>

      <h3>Custom Facets</h3>

      <p>ABSTRACTU extends the Diamond functionality with custom facets:</p>

      <ol>
        <li><strong>SubmissionFacet</strong>: Manages content submissions</li>
        <li><strong>EvaluationFacet</strong>: Handles the evaluation of submissions</li>
        <li><strong>TokenFacet</strong>: Manages tokenization of content (planned)</li>
      </ol>

      <h2>Advantages of Using the Diamond Standard</h2>

      <p>The Diamond Standard provides several benefits for the ABSTRACTU platform:</p>

      <ol>
        <li>
          <strong>Upgradeability</strong>: Functionality can be updated without migrating state or changing addresses
        </li>
        <li>
          <strong>Modularity</strong>: Features are organized into logical facets for better code organization
        </li>
        <li>
          <strong>Unlimited Contract Size</strong>: Bypasses the 24KB contract size limit through delegation
        </li>
        <li><strong>Gas Efficiency</strong>: Users only pay gas for the functions they use</li>
        <li>
          <strong>Single Address</strong>: Users and integrators interact with a single contract address
        </li>
      </ol>

      <h2>Interacting with Diamonds</h2>

      <p>When interacting with the ABSTRACTU Diamond contract:</p>

      <pre><code>{`// Connect to the Diamond contract with the ABI of all facets
const diamondAddress = '0x...';
const diamondABI = [...]; // Combined ABI of all facets
const diamond = new ethers.Contract(diamondAddress, diamondABI, provider);

// Call functions on any facet through the Diamond
const result = await diamond.myFacetFunction(param1, param2);`}</code></pre>

      <h2>Security Considerations</h2>

      <p>When working with Diamond contracts:</p>

      <ol>
        <li>
          <strong>Storage Conflicts</strong>: Facets share storage, so careful storage layout is essential
        </li>
        <li>
          <strong>Access Control</strong>: Only authorized addresses should be able to perform diamond cuts
        </li>
        <li>
          <strong>Immutable Functions</strong>: Critical functions should be immutable to prevent security issues
        </li>
        <li>
          <strong>Upgrade Testing</strong>: Thoroughly test upgrades before applying them to production
        </li>
      </ol>

      <h2>Further Reading</h2>

      <p>For more detailed information about the Diamond Standard:</p>

      <ul>
        <li>
          <a
            href="https://eips.ethereum.org/EIPS/eip-2535"
            target="_blank"
            rel="noopener noreferrer"
          >
            EIP-2535 Specification
          </a>
        </li>
        <li>
          <a
            href="https://github.com/mudgen/diamond-3"
            target="_blank"
            rel="noopener noreferrer"
          >
            Diamond Standard Reference Implementation
          </a>
        </li>
        <li>
          <a
            href="https://eip2535diamonds.substack.com/p/diamond-storage-pattern"
            target="_blank"
            rel="noopener noreferrer"
          >
            Diamond Storage Pattern
          </a>
        </li>
      </ul>
    </div>
  );
} 
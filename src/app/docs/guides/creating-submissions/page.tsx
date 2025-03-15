'use client';

export default function CreatingSubmissionsPage() {
  return (
    <div className="docs-page">
      <h1>Creating and Managing Submissions</h1>

      <p>
        This guide explains how to create and manage content submissions on the ABSTRACTU platform,
        both from a smart contract interaction perspective and through the user interface.
      </p>

      <h2>Overview</h2>

      <p>
        ABSTRACTU allows content creators to submit their work for evaluation and inclusion on the
        platform. Submissions go through several states during their lifecycle, from creation to
        evaluation.
      </p>

      <h2>Submission Lifecycle</h2>

      <p>A submission in ABSTRACTU follows this lifecycle:</p>

      <ol>
        <li><strong>Draft</strong> - Initial creation, can be updated</li>
        <li><strong>Submitted</strong> - Finalized by author, awaiting evaluation</li>
        <li><strong>Approved</strong> - Evaluated and accepted</li>
        <li><strong>Rejected</strong> - Evaluated and declined</li>
        <li><strong>Purged</strong> - Removed from active system</li>
      </ol>

      <h2>Prerequisites</h2>

      <p>Before creating a submission, ensure you have:</p>

      <ul>
        <li>
          An Ethereum wallet (e.g., MetaMask) with some ETH for gas fees
        </li>
        <li>Content prepared for submission (text, images, etc.)</li>
        <li>The content uploaded to IPFS to obtain a content hash</li>
      </ul>

      <h2>Creating a Submission via Smart Contract</h2>

      <p>To interact directly with the smart contract:</p>

      <pre><code>{`// Example using ethers.js
const { ethers } = require('ethers');

// Connect to the ABSTRACTU Diamond contract
const diamondAddress = '0x...'; // ABSTRACTU Diamond address
const submissionFacetABI = [...]; // ABI for the SubmissionFacet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const submissionFacet = new ethers.Contract(diamondAddress, submissionFacetABI, signer);

// Create a new submission
async function createSubmission(title, description, contentHash) {
  try {
    const tx = await submissionFacet.createSubmission(title, description, contentHash);
    const receipt = await tx.wait();
    
    // Find the SubmissionCreated event to get the submission ID
    const event = receipt.events.find(e => e.event === 'SubmissionCreated');
    const submissionId = event.args.submissionId;
    
    console.log(\`Submission created with ID: \${submissionId}\`);
    return submissionId;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

// Update a draft submission
async function updateSubmission(submissionId, title, description, contentHash) {
  try {
    const tx = await submissionFacet.updateSubmission(submissionId, title, description, contentHash);
    await tx.wait();
    console.log(\`Submission \${submissionId} updated\`);
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

// Finalize a submission
async function finalizeSubmission(submissionId) {
  try {
    const tx = await submissionFacet.finalizeSubmission(submissionId);
    await tx.wait();
    console.log(\`Submission \${submissionId} finalized\`);
  } catch (error) {
    console.error('Error finalizing submission:', error);
    throw error;
  }
}`}</code></pre>

      <h2>Creating a Submission via User Interface</h2>

      <p>
        The ABSTRACTU platform provides a user-friendly interface for creating and managing
        submissions:
      </p>

      <ol>
        <li><strong>Connect Wallet</strong>: Connect your Ethereum wallet to the platform</li>
        <li><strong>Navigate to Submissions</strong>: Go to the "My Submissions" section</li>
        <li><strong>Create New</strong>: Click the "Create New Submission" button</li>
        <li>
          <strong>Fill Details</strong>:
          <ul>
            <li>Enter a title for your submission</li>
            <li>Provide a description</li>
            <li>Upload your content to IPFS (the platform may handle this automatically)</li>
            <li>Review your submission</li>
          </ul>
        </li>
        <li><strong>Save as Draft</strong>: Your submission will be saved as a draft</li>
        <li><strong>Edit if Needed</strong>: You can make changes to your draft as needed</li>
        <li>
          <strong>Finalize</strong>: When ready, click "Finalize Submission" to submit for
          evaluation
        </li>
      </ol>

      <h2>Managing Your Submissions</h2>

      <p>After creating submissions, you can manage them through the platform:</p>

      <h3>Viewing Submissions</h3>

      <p>To view your submissions:</p>

      <ol>
        <li>Navigate to the "My Submissions" dashboard</li>
        <li>See all your submissions organized by status</li>
        <li>Click on any submission to view details</li>
      </ol>

      <h3>Tracking Status</h3>

      <p>Monitor the status of your submissions:</p>

      <ul>
        <li>
          <strong>Draft</strong>: Still in editing phase, not yet submitted for evaluation
        </li>
        <li><strong>Submitted</strong>: Awaiting evaluation by the foundation</li>
        <li>
          <strong>Approved</strong>: Successfully approved and published on the platform
        </li>
        <li><strong>Rejected</strong>: Not approved for publication on the platform</li>
      </ul>

      <h3>Receiving Feedback</h3>

      <p>For evaluated submissions:</p>

      <ol>
        <li>Navigate to the submission details</li>
        <li>View the evaluation score and feedback</li>
        <li>For rejected submissions, consider the feedback for future improvements</li>
      </ol>

      <h2>Best Practices</h2>

      <p>For the best chance of approval:</p>

      <ol>
        <li>
          <strong>Quality Content</strong>: Focus on creating original, high-quality content
        </li>
        <li><strong>Clear Description</strong>: Provide a clear and accurate description</li>
        <li><strong>Proper Formatting</strong>: Ensure your content is properly formatted</li>
        <li>
          <strong>Multiple Drafts</strong>: Use the draft status to refine your submission before
          finalizing
        </li>
        <li>
          <strong>Review Guidelines</strong>: Familiarize yourself with the platform's content
          guidelines
        </li>
      </ol>

      <h2>Troubleshooting</h2>

      <p>Common issues and solutions:</p>

      <h3>Transaction Failed</h3>

      <p>If your submission transaction fails:</p>
      <ul>
        <li>Check that you have enough ETH for gas fees</li>
        <li>Ensure you're not blacklisted</li>
        <li>Verify your wallet is properly connected</li>
      </ul>

      <h3>Can't Update Submission</h3>

      <p>If you can't update your submission:</p>
      <ul>
        <li>Verify the submission is still in Draft status</li>
        <li>Ensure you're using the same wallet that created the submission</li>
        <li>Check that all required fields are filled</li>
      </ul>

      <h3>Submission Stuck in Processing</h3>

      <p>If your submission appears stuck:</p>
      <ul>
        <li>Check your transaction status on the blockchain explorer</li>
        <li>Refresh the page or reconnect your wallet</li>
        <li>Contact support if the issue persists</li>
      </ul>

      <h2>Next Steps</h2>

      <p>After creating submissions:</p>

      <ul>
        <li>
          Learn about the <a href="/docs/guides/evaluating-content">evaluation process</a>
        </li>
        <li>
          Explore how to <a href="/docs/api/javascript-sdk">view published content</a>
        </li>
        <li>
          Consider applying for <a href="/docs/faq">content creator privileges</a>
        </li>
      </ul>
    </div>
  );
} 
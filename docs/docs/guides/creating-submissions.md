---
sidebar_position: 1
---

# Creating and Managing Submissions

This guide explains how to create and manage content submissions on the ABSTRACTU platform, both from a smart contract interaction perspective and through the user interface.

## Overview

ABSTRACTU allows content creators to submit their work for evaluation and inclusion on the platform. Submissions go through several states during their lifecycle, from creation to evaluation.

## Submission Lifecycle

A submission in ABSTRACTU follows this lifecycle:

1. **Draft** - Initial creation, can be updated
2. **Submitted** - Finalized by author, awaiting evaluation
3. **Approved** - Evaluated and accepted
4. **Rejected** - Evaluated and declined
5. **Purged** - Removed from active system

## Prerequisites

Before creating a submission, ensure you have:

- An Ethereum wallet (e.g., MetaMask) with some ETH for gas fees
- Content prepared for submission (text, images, etc.)
- The content uploaded to IPFS to obtain a content hash

## Creating a Submission via Smart Contract

To interact directly with the smart contract:

```javascript
// Example using ethers.js
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
    
    console.log(`Submission created with ID: ${submissionId}`);
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
    console.log(`Submission ${submissionId} updated`);
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
    console.log(`Submission ${submissionId} finalized`);
  } catch (error) {
    console.error('Error finalizing submission:', error);
    throw error;
  }
}
```

## Creating a Submission via User Interface

The ABSTRACTU platform provides a user-friendly interface for creating and managing submissions:

1. **Connect Wallet**: Connect your Ethereum wallet to the platform
2. **Navigate to Submissions**: Go to the "My Submissions" section
3. **Create New**: Click the "Create New Submission" button
4. **Fill Details**: 
   - Enter a title for your submission
   - Provide a description
   - Upload your content to IPFS (the platform may handle this automatically)
   - Review your submission
5. **Save as Draft**: Your submission will be saved as a draft
6. **Edit if Needed**: You can make changes to your draft as needed
7. **Finalize**: When ready, click "Finalize Submission" to submit for evaluation

## Managing Your Submissions

After creating submissions, you can manage them through the platform:

### Viewing Submissions

To view your submissions:

1. Navigate to the "My Submissions" dashboard
2. See all your submissions organized by status
3. Click on any submission to view details

### Tracking Status

Monitor the status of your submissions:

- **Draft**: Still in editing phase, not yet submitted for evaluation
- **Submitted**: Awaiting evaluation by the foundation
- **Approved**: Successfully approved and published on the platform
- **Rejected**: Not approved for publication on the platform

### Receiving Feedback

For evaluated submissions:

1. Navigate to the submission details
2. View the evaluation score and feedback
3. For rejected submissions, consider the feedback for future improvements

## Best Practices

For the best chance of approval:

1. **Quality Content**: Focus on creating original, high-quality content
2. **Clear Description**: Provide a clear and accurate description
3. **Proper Formatting**: Ensure your content is properly formatted
4. **Multiple Drafts**: Use the draft status to refine your submission before finalizing
5. **Review Guidelines**: Familiarize yourself with the platform's content guidelines

## Troubleshooting

Common issues and solutions:

### Transaction Failed

If your submission transaction fails:
- Check that you have enough ETH for gas fees
- Ensure you're not blacklisted
- Verify your wallet is properly connected

### Can't Update Submission

If you can't update your submission:
- Verify the submission is still in Draft status
- Ensure you're using the same wallet that created the submission
- Check that all required fields are filled

### Submission Stuck in Processing

If your submission appears stuck:
- Check your transaction status on the blockchain explorer
- Refresh the page or reconnect your wallet
- Contact support if the issue persists

## Next Steps

After creating submissions:

- Learn about the [evaluation process](./evaluating-content.md)
- Explore how to [view published content](../api/javascript-sdk.md)
- Consider applying for [content creator privileges](../faq.md) 
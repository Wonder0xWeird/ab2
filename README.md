# ABSTRACTU

## Overview
ABSTRACTU (Ab2) is an experimental web platform for exploring philosophical content through a recursive abstraction model. The project features both an engaging homepage with interactive animations and a MUSE interface with a unique draggable viewport that allows users to navigate through content in a non-linear, explorative way. ABSTRACTU embodies the concept of a meta-abstractor - a system that not only abstracts reality but can abstract its own process of abstraction.

## Live Demo
Visit the live site at [muse.ab2.observer](https://muse.ab2.observer)

## Key Features
- Interactive homepage with dynamic "A" logo animation
- Spatial canvas interface with draggable viewport
- Philosophical content exploration with sequential and parallel discovery paths
- Minimalist design focused on typography
- Responsive layout for various device sizes
- Smooth animations and transitions
- Cohesive documentation interface with background pattern integration
- Diamond Standard smart contracts for upgradeable blockchain integration
- Contribution and evaluation system based on ergodic principles

## Philosophical Foundations
ABSTRACTU is guided by several key philosophical concepts:

### The Upward Spiral of Abstraction
The platform embodies the principle that "those things which are more effective and efficient at abstracting themselves will abstract themselves into things which tend to be more effective and efficient at abstracting themselves, yielding an upward spiral of abstraction." This recursive self-improvement leads toward a meta-abstractor that drives reality toward ever more optimal abstractions.

### Ergodicity in Knowledge Creation
ABSTRACTU implements the concept of ergodicity - where the time average of a system's behavior equals the space average of its possible states. This manifests in two complementary knowledge creation approaches:

1. **Sequential Refinement (Vertical Exploration)**: Building upon and refining previous work
2. **Parallel Exploration (Horizontal Exploration)**: Diverse approaches to similar problems

The architecture supports both paths, hypothesizing that they will ultimately converge on similar optimal abstractions, mirroring evolutionary processes.

## Technical Stack
- Next.js (App Router)
- TypeScript
- Custom CSS animations
- Solidity smart contracts
- Hardhat development environment
- Abstract Blockchain (EVM-compatible)
- MongoDB for draft storage
- Filecoin for permanent storage
- Vercel Deployment

## Local Development
To run the project locally:

```bash
# Clone the repository
git clone https://github.com/your-username/ab2.git

# Navigate to the project directory
cd ab2

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure
- `src/app`: Next.js app router pages
- `src/components`: Reusable React components
- `src/styles`: Global styles and animation definitions
- `content`: Markdown content for philosophical pieces
- `docs`: Documentation markdown files
- `contracts`: Smart contract code and deployment scripts

## Animation Features
The project includes several sophisticated animation techniques:
- Multi-stage entrance animation for the homepage logo
- Continuous subtle floating animation for ambient movement
- Interactive hover effects with scaling, rotation, and color changes
- Pulsating glow effects using CSS filters and text-shadow
- Smooth transitions between animation states

## Documentation Interface
The documentation section features:
- Floating transparent sidebar navigation with gold-accented cards
- Consistent background pattern tiling across all pages
- Animated content transitions for smooth page loads
- Gradient underlines for section headings
- Mobile-responsive layout with adaptive navigation

## Smart Contract Implementation
The project implements a blockchain component using the Diamond Standard (EIP-2535):

- **Diamond Architecture**: Upgradeable contract system with multiple facets
- **Core Facets**:
  - DiamondCut: Manages contract upgrades
  - DiamondLoupe: Provides contract introspection
  - Ownership: Handles access control
  - Contribution: Manages content contributions and ACRONTU evaluation
- **Extensible Design**:
  - Version tracking at both facet and contribution levels
  - Status constants instead of enums for future expandability
  - Configurable thresholds and evaluation criteria
  - Helper functions for cross-facet interactions
- **Development Environment**:
  - Hardhat for local development and testing
  - TypeScript for type-safe contract interaction
  - Comprehensive test suite for all facets
  - Deployment scripts for testnet and mainnet

## Contribution System Architecture
ABSTRACTU implements a hybrid architecture for content contributions:

1. **Draft Storage**: MongoDB database stores draft contributions during development
2. **Evaluation**: ACRONTU system evaluates submissions using AI-based criteria
3. **Permanent Storage**: Accepted contributions stored on Filecoin network
4. **Blockchain Record**: Abstract blockchain records metadata, status, and Filecoin CIDs

This system creates an efficient pipeline where only quality content receives permanent storage while maintaining a record of all contributions and their status.

## Cryptographic Implementation
We're expanding ABSTRACTU with a blockchain component using the Diamond Standard (EIP-2535):

- **Smart Contract Architecture**: Implementing upgradeable contracts that will facilitate a system for contributing and evaluating knowledge
- **Diamond Pattern**: Using a modular approach with facets for extensibility and upgradability
- **Incentivization Mechanism**: Developing a system to recognize and reward novel, useful contributions
- **Abstract Blockchain Integration**: Leveraging EVM compatibility with zero-knowledge capabilities

The cryptographic implementation aims to create an incentive mechanism for contributing valuable knowledge while making it accessible through a decentralized approach.

## Future Development
- Expansion of the OBSERVER section
- User authentication system
- Content submission API
- AI integration for content generation
- Community collaboration tools
- Token economics for contribution incentives
- Zero-knowledge features for private content access

## Authentication System

The ABSTRACTU platform uses Ethereum-based authentication (Sign-In with Ethereum) to provide a seamless and secure authentication experience for users.

### Features

- **Wallet-Based Authentication**: Users can sign in using their Ethereum wallets
- **Message Signing**: Authentication is done by signing a message with the user's wallet, without sharing private keys
- **JSON Web Tokens**: After successful authentication, a JWT is issued for subsequent API calls
- **Protected API Routes**: Secure routes for creating and managing contributions
- **Persistent Sessions**: Authentication state is preserved across page refreshes
- **Replay Attack Prevention**: Uses MongoDB to store one-time nonces and timestamps
- **Hydration-Safe Components**: Specially designed to work with both server and client rendering

### Tech Stack

- **NextAuth.js**: Handles authentication session management
- **RainbowKit**: Provides wallet connection UI and wallet management
- **SIWE (Sign In With Ethereum)**: Ethereum-based authentication protocol
- **Wagmi**: React hooks for Ethereum wallet interactions
- **JWT**: Custom token generation for API authentication
- **MongoDB**: Stores authentication nonces and prevents replay attacks

### Authentication Flow

1. User connects their wallet using RainbowKit
2. Server generates a unique nonce and stores it in MongoDB
3. User signs a message containing the nonce and timestamp using SIWE protocol
4. Server verifies the signature and validates the nonce against MongoDB
5. Upon successful verification, the nonce is deleted to prevent reuse
6. A JWT token is generated with the user's address and added to the session
7. The authenticated session is used for secure API access

### Client-Side Architecture

To ensure compatibility with Next.js's server components and prevent hydration errors, the authentication components follow a two-layer architecture:

- **Outer Component**: Handles mounting state and defers rendering until client-side hydration
- **Inner Component**: Contains all wallet-specific functionality and is only rendered client-side

This pattern ensures that wallet operations only occur in a fully client-side context, preventing hydration mismatches.

### Environment Variables

To set up authentication, add these variables to your `.env.local` file:

```
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-for-jwt

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_ID=your-walletconnect-project-id

# JWT for Auth Token
JWT_SECRET=your-jwt-secret-for-custom-tokens

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/abstractu
MONGODB_DB=abstractu
```

### Pages

- `/auth/signin` - Sign-in page with wallet connection
- `/dashboard` - User dashboard showing wallet info and navigation

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Special thanks to Claude for philosophical insights
- Inspired by spatial interfaces and non-linear content exploration

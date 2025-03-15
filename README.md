# ABSTRACTU

## Overview
ABSTRACTU (Ab2) is an experimental web platform for exploring philosophical content. The project features both an engaging homepage with interactive animations and a MUSE interface with a unique draggable viewport that allows users to navigate through content in a non-linear, explorative way.

## Live Demo
Visit the live site at [muse.ab2.observer](https://muse.ab2.observer)

## Key Features
- Interactive homepage with dynamic "A" logo animation
- Spatial canvas interface with draggable viewport
- Philosophical content exploration
- Minimalist design focused on typography
- Responsive layout for various device sizes
- Smooth animations and transitions
- Cohesive documentation interface with background pattern integration
- Diamond Standard smart contracts for upgradeable blockchain integration
- Content submission and evaluation system (in development)

## Technical Stack
- Next.js (App Router)
- TypeScript
- Custom CSS animations
- Solidity smart contracts
- Hardhat development environment
- Abstract Blockchain (EVM-compatible)
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
  - Submission: Manages content contributions
- **Development Environment**:
  - Hardhat for local development and testing
  - TypeScript for type-safe contract interaction
  - Comprehensive test suite for all facets
  - Deployment scripts for testnet and mainnet

The smart contract implementation aims to create an incentive mechanism for contributing valuable knowledge while making it accessible through a decentralized approach.

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

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Special thanks to Claude for philosophical insights
- Inspired by spatial interfaces and non-linear content exploration

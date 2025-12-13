# NFT Vault Auction Frontend

A Web3 frontend for a Blind NFT Vault Auction Platform on Monad.

## Features

- 🎯 **Blind Bidding**: Bid on mystery vaults without seeing NFTs
- ⚡ **Fast & Competitive**: Real-time updates with +1 wei increment bidding
- 🎮 **Game-like UX**: Animations, countdown timers, and celebration effects
- 🔄 **Network Switching**: Seamlessly switch between Local Hardhat and Monad Testnet
- 🎨 **Modern UI**: Dark theme with neon accents and glassmorphism

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **wagmi + viem** (Web3)
- **RainbowKit** (wallet connection)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Network Selection: "local" or "monad"
NEXT_PUBLIC_NETWORK=local

# Local Hardhat Network
NEXT_PUBLIC_LOCAL_RPC=http://127.0.0.1:8545
NEXT_PUBLIC_VAULT_AUCTION_LOCAL_ADDRESS=0xYourLocalContractAddress

# Monad Testnet
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_VAULT_AUCTION_MONAD_ADDRESS=0xYourMonadContractAddress

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 3. Deploy Contract

1. Deploy the `VaultAuction` contract to your network
2. Copy the contract address to the appropriate environment variable
3. Update the Monad testnet chain ID in `config/network.ts` when available

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Network Configuration

The app automatically switches between networks based on `NEXT_PUBLIC_NETWORK`:

- **local**: Uses Hardhat local network (Chain ID: 31337)
- **monad**: Uses Monad Testnet (Chain ID: TBD)

The network configuration is centralized in `config/network.ts` and used throughout the app.

## Pages

### `/` - Landing Page
- Hero section with "Storage Wars for NFTs"
- CTA buttons for sellers and buyers
- Animated vault cards

### `/seller` - Seller Page
- Step-by-step vault creation
- NFT approval flow
- Auction start configuration

### `/auction/[vaultId]` - Auction Page
- Real-time bid display
- Countdown timer
- Bid button with animations
- NFT reveal after auction ends

## Components

- **VaultCard**: Displays vault information with rarity badges
- **BidButton**: Animated bid button with pulse effects
- **CountdownTimer**: Urgency-based countdown with color changes
- **WalletStatus**: Network detection and wallet connection status
- **RarityBadge**: Visual rarity composition display

## Web3 Hooks

All contract interactions are handled through custom hooks in `hooks/useVaultAuction.ts`:

- `useAuction(vaultId)`: Read auction data with auto-refresh
- `useBid()`: Place bids on auctions
- `useCreateVault()`: Create new vaults
- `useStartAuction()`: Start auctions
- `useApproveNFT()`: Approve NFTs for vault creation
- `useVaultNFTs(vaultId)`: Get vault NFT list (after auction ends)

## Building for Production

```bash
npm run build
npm start
```

## Notes

- The app polls auction data every 2 seconds for real-time updates
- Confetti animation triggers on successful bids
- Network switching is handled automatically via wagmi
- All errors are user-friendly and displayed via toast notifications


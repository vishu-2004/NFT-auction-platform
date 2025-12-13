import { defineChain } from "viem";

// Get network from environment
const network = process.env.NEXT_PUBLIC_NETWORK || "local";

// Local Hardhat Chain
const localChain = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545"],
    },
  },
});

// Monad Testnet Chain
// Note: Update chain ID when Monad testnet details are available
const monadTestnet = defineChain({
  id: 10143, // Placeholder - update with actual Monad testnet chain ID
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"],
    },
  },
});

// Export configuration based on environment
export const networkConfig = {
  chain: network === "monad" ? monadTestnet : localChain,
  rpcUrl:
    network === "monad"
      ? process.env.NEXT_PUBLIC_MONAD_RPC || "https://testnet-rpc.monad.xyz"
      : process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545",
  vaultAuctionAddress:
    network === "monad"
      ? (process.env.NEXT_PUBLIC_VAULT_AUCTION_MONAD_ADDRESS as `0x${string}`)
      : (process.env.NEXT_PUBLIC_VAULT_AUCTION_LOCAL_ADDRESS as `0x${string}`),
  network,
};

// Validate configuration
if (!networkConfig.vaultAuctionAddress) {
  console.warn(
    `⚠️  VaultAuction contract address not set for ${network} network. Please set NEXT_PUBLIC_VAULT_AUCTION_${network.toUpperCase()}_ADDRESS in .env.local`
  );
}


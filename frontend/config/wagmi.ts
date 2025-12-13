import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { networkConfig } from "./network";

// Ensure we have a valid project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const wagmiConfig = getDefaultConfig({
  appName: "NFT Vault Auction",
  projectId: projectId,
  chains: [networkConfig.chain],
  ssr: true,
});


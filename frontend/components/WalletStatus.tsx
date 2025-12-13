"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { networkConfig } from "@/config/network";
import { motion } from "framer-motion";

export function WalletStatus() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const correctChainId = networkConfig.chain.id;
  const isWrongNetwork = isConnected && chainId !== correctChainId;

  if (!isConnected) {
    return null;
  }

  if (isWrongNetwork) {
    return (
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass border-2 border-neon-pink p-4 rounded-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div>
            <div className="text-neon-pink font-bold">
              Wrong Network Detected
            </div>
            <div className="text-sm text-gray-400">
              Please switch to {networkConfig.chain.name}
            </div>
          </div>
          <button
            onClick={() => switchChain({ chainId: correctChainId })}
            className="px-4 py-2 bg-neon-pink text-white rounded-lg font-bold hover:opacity-80 transition"
          >
            Switch Network
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed top-4 right-4 glass p-3 rounded-lg text-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="text-gray-400">Connected</div>
      <div className="text-neon-green font-mono text-xs">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
    </motion.div>
  );
}


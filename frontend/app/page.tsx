"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleEnterAuction = () => {
    if (!isConnected) {
      // Show connect button/modal
      setShowConnectModal(true);
    } else {
      // Redirect to auction 0 if connected
      router.push("/auction/0");
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-neon-green opacity-10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-neon-purple opacity-10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="text-2xl font-bold text-[#00ff88]" style={{ textShadow: "0 0 10px rgba(0, 255, 136, 0.8)" }}>VAULT</div>
        <div>
          {showConnectModal && !isConnected ? (
            <div className="glass p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Connect wallet to continue</p>
              <ConnectButton />
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.h1
          className="text-7xl md:text-9xl font-bold mb-6 text-[#00ff88]"
          style={{ textShadow: "0 0 10px rgba(0, 255, 136, 0.8), 0 0 20px rgba(0, 255, 136, 0.6)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Storage Wars
        </motion.h1>
        <motion.p
          className="text-2xl md:text-4xl text-gray-400 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          for NFTs
        </motion.p>
        <motion.p
          className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Bid blindly on mystery vaults. Only rarity and estimated value revealed.
          Fast, competitive, game-like auctions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/seller">
            <motion.button
              className="px-8 py-4 bg-neon-green text-dark-bg font-bold text-lg rounded-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0, 255, 136, 0.5)",
                  "0 0 40px rgba(0, 255, 136, 0.8)",
                  "0 0 20px rgba(0, 255, 136, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="relative z-10">Create Vault</span>
              <motion.div
                className="absolute inset-0 bg-neon-green opacity-0 group-hover:opacity-20"
                initial={false}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </motion.button>
          </Link>

          <Link href="/auction/0">
            <motion.button
              onClick={(e) => {
                if (!isConnected) {
                  e.preventDefault();
                  handleEnterAuction();
                }
              }}
              className="px-8 py-4 glass border-2 border-neon-purple text-neon-purple font-bold text-lg rounded-lg"
              whileHover={{ scale: 1.05, borderColor: "#a855f7" }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Auction
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating vault cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="glass p-6 rounded-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.8,
                delay: 0.8 + i * 0.2,
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <div className="text-4xl mb-2">🔒</div>
              <div className="text-sm text-gray-400">Vault #{i}</div>
              <div className="text-xs text-neon-green mt-2">Active</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


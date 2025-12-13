"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { useApproveNFT, useCreateVault, useStartAuction } from "@/hooks/useVaultAuction";
import { parseEther } from "viem";
import Link from "next/link";
import { WalletStatus } from "@/components/WalletStatus";

type Step = 1 | 2 | 3;

export default function SellerPage() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<Step>(1);
  const [nftAddress, setNftAddress] = useState("");
  const [tokenIds, setTokenIds] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [duration, setDuration] = useState("3600"); // 1 hour default
  const [vaultId, setVaultId] = useState<bigint | null>(null);

  const { approveNFT, isPending: isApproving, isSuccess: isApproved } =
    useApproveNFT();
  const { createVault, isPending: isCreating, isSuccess: isVaultCreated } =
    useCreateVault();
  const { startAuction, isPending: isStarting, isSuccess: isAuctionStarted } =
    useStartAuction();

  // Step 1: Approve NFTs
  const handleApprove = async () => {
    if (!nftAddress) {
      alert("Please enter NFT contract address");
      return;
    }
    await approveNFT(nftAddress as `0x${string}`);
  };

  // Step 2: Create Vault
  const handleCreateVault = async () => {
    if (!nftAddress || !tokenIds) {
      alert("Please fill all fields");
      return;
    }

    const addresses = tokenIds
      .split(",")
      .map(() => nftAddress.trim() as `0x${string}`);
    const ids = tokenIds
      .split(",")
      .map((id) => BigInt(id.trim()));

    await createVault(addresses, ids);
  };

  // Step 3: Start Auction
  const handleStartAuction = async () => {
    if (!vaultId || !startPrice || !duration) {
      alert("Please fill all fields");
      return;
    }
    await startAuction(vaultId, startPrice, BigInt(duration));
  };

  // Auto-advance steps
  if (isApproved && step === 1) {
    setStep(2);
  }
  if (isVaultCreated && step === 2) {
    // Get vault count - in a real app, you'd read this from the contract
    // For now, we'll use a placeholder
    setVaultId(0n); // This should be read from contract
    setStep(3);
  }
  if (isAuctionStarted && step === 3) {
    // Redirect to auction page
    window.location.href = `/auction/${vaultId}`;
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <WalletStatus />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold neon-glow">
            VAULT
          </Link>
          <ConnectButton />
        </div>

        {!isConnected ? (
          <motion.div
            className="glass p-8 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to create a vault
            </p>
            <ConnectButton />
          </motion.div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex justify-center mb-12 gap-4">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? "bg-neon-green text-dark-bg"
                      : "glass text-gray-400"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: s * 0.1 }}
                >
                  {s}
                </motion.div>
              ))}
            </div>

            {/* Step 1: Approve NFTs */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  className="glass p-8 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Step 1: Approve NFTs</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        NFT Contract Address
                      </label>
                      <input
                        type="text"
                        value={nftAddress}
                        onChange={(e) => setNftAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white"
                        placeholder="0x..."
                      />
                    </div>
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || isApproved || !nftAddress}
                      className="w-full px-6 py-4 bg-neon-green text-dark-bg font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
                    >
                      {isApproving
                        ? "Approving..."
                        : isApproved
                        ? "✓ Approved"
                        : "Approve NFTs"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Create Vault */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  className="glass p-8 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Step 2: Create Vault</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        NFT Contract Address
                      </label>
                      <input
                        type="text"
                        value={nftAddress}
                        onChange={(e) => setNftAddress(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white"
                        placeholder="0x..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Token IDs (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={tokenIds}
                        onChange={(e) => setTokenIds(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white"
                        placeholder="1, 2, 3"
                      />
                    </div>
                    <button
                      onClick={handleCreateVault}
                      disabled={isCreating || isVaultCreated}
                      className="w-full px-6 py-4 bg-neon-green text-dark-bg font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
                    >
                      {isCreating
                        ? "Creating..."
                        : isVaultCreated
                        ? "✓ Vault Created"
                        : "Create Vault"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Start Auction */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  className="glass p-8 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Step 3: Start Auction</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Vault ID
                      </label>
                      <input
                        type="text"
                        value={vaultId?.toString() || ""}
                        readOnly
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Start Price (ETH)
                      </label>
                      <input
                        type="text"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white"
                        placeholder="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-lg text-white"
                        placeholder="3600"
                      />
                    </div>
                    <button
                      onClick={handleStartAuction}
                      disabled={isStarting || isAuctionStarted}
                      className="w-full px-6 py-4 bg-neon-purple text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
                    >
                      {isStarting
                        ? "Starting..."
                        : isAuctionStarted
                        ? "✓ Auction Started"
                        : "Start Auction"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}


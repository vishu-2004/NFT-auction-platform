"use client";

import { useParams } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { formatEther, parseEther } from "viem";
import { useState, useEffect } from "react";
import { VaultCard } from "@/components/VaultCard";
import { BidButton } from "@/components/BidButton";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WalletStatus } from "@/components/WalletStatus";
import { useAuction, useBid, useVaultNFTs, useEndAuction } from "@/hooks/useVaultAuction";
import { networkConfig } from "@/config/network";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function AuctionPage() {
  const params = useParams();
  const vaultId = BigInt(params.vaultId as string);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { auction, refetch } = useAuction(vaultId);
  const [showReveal, setShowReveal] = useState(false);
  const [countdownEnded, setCountdownEnded] = useState(false);
  // Only fetch NFTs after auction ends
  const { nfts, refetch: refetchNFTs } = useVaultNFTs(vaultId, showReveal);
  const { bid, isPending: isBidding } = useBid();
  const { endAuction, isPending: isEnding } = useEndAuction();
  const [lastBid, setLastBid] = useState<bigint | null>(null);
  const [shouldShake, setShouldShake] = useState(false);

  const isWrongNetwork = isConnected && chainId !== networkConfig.chain.id;
  const canBid =
    isConnected &&
    !isWrongNetwork &&
    auction?.active &&
    !auction.ended &&
    auction.endTime > BigInt(Math.floor(Date.now() / 1000));

  // Calculate next bid amount (currentBid + 1 wei)
  const nextBidAmount = auction?.currentBid
    ? formatEther(auction.currentBid + 1n)
    : "0";

  // Detect bid changes and trigger confetti
  useEffect(() => {
    if (auction?.currentBid && lastBid !== null && auction.currentBid > lastBid) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00ff88", "#a855f7", "#ec4899"],
      });
    }
    if (auction?.currentBid) {
      setLastBid(auction.currentBid);
    }
  }, [auction?.currentBid, lastBid]);

  // Check if auction ended and fetch NFTs
  useEffect(() => {
    if (auction?.ended && !showReveal) {
      setShowReveal(true);
      refetchNFTs();
    }
  }, [auction?.ended, showReveal, refetchNFTs]);

  const handleBid = async () => {
    if (!auction?.currentBid) return;
    try {
      const result = await bid(vaultId, auction.currentBid + 1n);
      if (result && !result.success && result.outbid) {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }
      await refetch();
    } catch (error) {
      // Error already handled in useBid hook
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const handleEndAuction = async () => {
    await endAuction(vaultId);
    await refetch();
    // Fetch NFTs after ending
    setShowReveal(true);
    await refetchNFTs();
  };

  const handleCountdownEnd = () => {
    setCountdownEnded(true);
    refetch();
  };

  // Mock rarity data (in production, this would come from an API or contract)
  const mockRarity = {
    common: 3,
    rare: 2,
    epic: 1,
    legendary: 0,
  };

  const estimatedValue = auction?.currentBid
    ? formatEther(auction.currentBid)
    : "0.1";

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <WalletStatus />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-2xl font-bold neon-glow">
          VAULT
        </Link>
        <ConnectButton />
      </div>

      <div className="max-w-6xl mx-auto">
        {!auction ? (
          <div className="text-center text-gray-400">Loading auction...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Vault Card */}
            <div className="lg:col-span-1">
              <VaultCard
                vaultId={Number(vaultId)}
                estimatedValue={estimatedValue}
                rarity={mockRarity}
              />
            </div>

            {/* Center Column - Main Auction UI */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Bid Display */}
              <motion.div
                className="glass p-8 rounded-2xl text-center border-2 border-neon-green/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={auction.currentBid.toString()}
              >
                <div className="text-sm text-gray-400 mb-2">Current Bid</div>
                <motion.div
                  className="text-6xl font-bold neon-glow mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 0,
                  }}
                >
                  {formatEther(auction.currentBid)} ETH
                </motion.div>
                {auction.highestBidder !==
                  "0x0000000000000000000000000000000000000000" && (
                  <div className="text-sm text-gray-400">
                    Leader: {auction.highestBidder.slice(0, 6)}...
                    {auction.highestBidder.slice(-4)}
                  </div>
                )}
              </motion.div>

              {/* Countdown Timer */}
              {auction.active && !auction.ended && (
                <motion.div
                  className="glass p-6 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CountdownTimer
                    endTime={auction.endTime}
                    onEnd={handleCountdownEnd}
                  />
                </motion.div>
              )}

              {/* End Auction Button - Show when countdown ends but auction not ended yet */}
              {countdownEnded && auction.active && !auction.ended && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={handleEndAuction}
                    disabled={isEnding}
                    className="px-8 py-4 bg-neon-purple text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition"
                  >
                    {isEnding ? "Ending Auction..." : "End Auction"}
                  </button>
                </motion.div>
              )}

              {/* Bid Button */}
              {auction.active && !auction.ended ? (
                <div className="flex justify-center">
                  {!isConnected ? (
                    <div className="glass p-6 rounded-xl text-center">
                      <p className="text-gray-400 mb-4">
                        Connect wallet to bid
                      </p>
                      <ConnectButton />
                    </div>
                  ) : isWrongNetwork ? (
                    <div className="glass p-6 rounded-xl text-center border-2 border-neon-pink">
                      <p className="text-neon-pink font-bold mb-2">
                        Wrong Network
                      </p>
                      <p className="text-sm text-gray-400">
                        Please switch to {networkConfig.chain.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center text-sm text-gray-400">
                        Next bid: {nextBidAmount} ETH
                      </div>
                      <motion.div
                        animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center"
                      >
                        <BidButton
                          onClick={handleBid}
                          disabled={!canBid}
                          isLoading={isBidding}
                          nextBidAmount={nextBidAmount}
                          onFailedBid={() => {
                            // Additional handling if needed
                          }}
                        />
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : auction.ended ? (
                <motion.div
                  className="glass p-8 rounded-2xl text-center border-2 border-neon-purple"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-4xl mb-4">🎉</div>
                  <div className="text-2xl font-bold mb-2">Auction Ended</div>
                  {auction.highestBidder !==
                    "0x0000000000000000000000000000000000000000" ? (
                    <div className="text-neon-green">
                      Winner: {auction.highestBidder.slice(0, 6)}...
                      {auction.highestBidder.slice(-4)}
                    </div>
                  ) : (
                    <div className="text-gray-400">No bids - NFTs returned to seller</div>
                  )}
                </motion.div>
              ) : (
                <div className="glass p-6 rounded-xl text-center text-gray-400">
                  Auction not started
                </div>
              )}

              {/* Reveal Section */}
              {showReveal && nfts && nfts.length > 0 && (
                <motion.div
                  className="glass p-8 rounded-2xl border-2 border-neon-purple"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-2xl font-bold mb-4 text-center">
                    🔓 Vault Opened
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {nfts.map((nft, index) => (
                      <motion.div
                        key={index}
                        className="glass p-4 rounded-lg text-center"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-4xl mb-2">🖼️</div>
                        <div className="text-xs text-gray-400 truncate">
                          {nft.nftAddress.slice(0, 6)}...
                          {nft.nftAddress.slice(-4)}
                        </div>
                        <div className="text-sm font-bold text-neon-green">
                          #{nft.tokenId.toString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


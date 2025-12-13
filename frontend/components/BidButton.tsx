"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface BidButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  nextBidAmount: string;
  onFailedBid?: () => void;
}

export function BidButton({
  onClick,
  disabled,
  isLoading,
  nextBidAmount,
  onFailedBid,
}: BidButtonProps) {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    try {
      await onClick();
    } catch (error) {
      // Trigger shake animation on failed bid
      setIsShaking(true);
      onFailedBid?.();
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <motion.button
      className="relative px-12 py-6 bg-neon-green text-dark-bg font-bold text-2xl rounded-xl overflow-hidden group"
      onClick={handleClick}
      disabled={disabled || isLoading}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={
        disabled
          ? {}
          : {
              boxShadow: [
                "0 0 30px rgba(0, 255, 136, 0.6)",
                "0 0 50px rgba(0, 255, 136, 0.9)",
                "0 0 30px rgba(0, 255, 136, 0.6)",
              ],
            }
      }
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      variants={{
        shake: {
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 },
        },
      }}
      animate={isShaking ? "shake" : ""}
    >
      <motion.div
        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
      <span className="relative z-10">
        {isLoading ? "Processing..." : "+1 BID"}
      </span>
    </motion.button>
  );
}


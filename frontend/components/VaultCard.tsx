"use client";

import { motion } from "framer-motion";
import { RarityBadge } from "./RarityBadge";

interface VaultCardProps {
  vaultId: number;
  estimatedValue?: string;
  rarity?: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export function VaultCard({ vaultId, estimatedValue, rarity }: VaultCardProps) {
  return (
    <motion.div
      className="glass p-8 rounded-2xl border-2 border-neon-green/30 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, borderColor: "rgba(0, 255, 136, 0.5)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-neon-green/5 blur-xl" />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold neon-glow mb-2">Vault #{vaultId}</h2>
          <p className="text-gray-400 text-sm">Mystery Contents</p>
        </div>

        {rarity && <RarityBadge rarity={rarity} />}

        {estimatedValue && (
          <div className="mt-6 p-4 glass rounded-lg border border-neon-purple/30">
            <div className="text-sm text-gray-400 mb-1">Estimated Value</div>
            <div className="text-2xl font-bold text-neon-purple">
              {estimatedValue} ETH
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}


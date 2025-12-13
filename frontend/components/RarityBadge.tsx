"use client";

import { motion } from "framer-motion";

interface RarityBadgeProps {
  rarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const rarities = [
    { name: "Common", count: rarity.common, color: "gray" },
    { name: "Rare", count: rarity.rare, color: "blue" },
    { name: "Epic", count: rarity.epic, color: "purple" },
    { name: "Legendary", count: rarity.legendary, color: "yellow" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-400 mb-2">Rarity Composition</div>
      <div className="grid grid-cols-2 gap-2">
        {rarities.map((item, index) => (
          <motion.div
            key={item.name}
            className="glass p-3 rounded-lg border border-white/10 flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-sm">{item.name}</span>
            <span className="text-neon-green font-bold">{item.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


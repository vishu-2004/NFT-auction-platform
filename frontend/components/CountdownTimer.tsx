"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: bigint;
  onEnd?: () => void;
}

export function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const remaining = Number(endTime - now);

      if (remaining <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onEnd?.();
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      setTimeLeft({ days, hours, minutes, seconds });
      setIsUrgent(remaining < 300); // Less than 5 minutes
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (!timeLeft) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <motion.div
      className={`text-center ${
        isUrgent ? "text-neon-pink" : "text-neon-green"
      }`}
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{
        scale: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
      <div className="text-4xl font-bold neon-glow">
        {timeLeft.days > 0 && `${formatTime(timeLeft.days)}:`}
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
        {formatTime(timeLeft.seconds)}
      </div>
    </motion.div>
  );
}


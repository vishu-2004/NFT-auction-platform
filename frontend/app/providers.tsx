"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/config/wagmi";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  try {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "rgba(20, 20, 20, 0.95)",
                  color: "#fff",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                },
                success: {
                  iconTheme: {
                    primary: "#00ff88",
                    secondary: "#0a0a0a",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ec4899",
                    secondary: "#0a0a0a",
                  },
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  } catch (error) {
    console.error("Provider error:", error);
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-red-500">
          Error loading app. Check console for details.
        </div>
      </div>
    );
  }
}


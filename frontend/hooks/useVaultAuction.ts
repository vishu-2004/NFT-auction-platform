"use client";

import { useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { networkConfig } from "@/config/network";
import VaultAuctionABI from "@/contracts/VaultAuction.json";
import toast from "react-hot-toast";

const contractAddress = networkConfig.vaultAuctionAddress;
const abi = VaultAuctionABI.abi;

export function useAuction(vaultId: bigint) {
  const { data, refetch, isLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getAuction",
    args: [vaultId],
    query: {
      refetchInterval: 2000, // Poll every 2 seconds
    },
  });

  return {
    auction: data as
      | {
          seller: `0x${string}`;
          currentBid: bigint;
          highestBidder: `0x${string}`;
          endTime: bigint;
          active: boolean;
          ended: boolean;
        }
      | undefined,
    refetch,
    isLoading,
  };
}

export function useVaultNFTs(vaultId: bigint, enabled: boolean = true) {
  const { data, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "getVaultNFTs",
    args: [vaultId],
    query: {
      enabled, // Only fetch when enabled (after auction ends)
    },
  });

  return {
    nfts: data as
      | Array<{
          nftAddress: `0x${string}`;
          tokenId: bigint;
        }>
      | undefined,
    isLoading,
    refetch,
  };
}

export function useEndAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const endAuction = async (vaultId: bigint) => {
    try {
      const txHash = await writeContract({
        address: contractAddress,
        abi,
        functionName: "endAuction",
        args: [vaultId],
      });
      toast.loading("Ending auction...", { id: "endAuction" });
      return txHash;
    } catch (err: any) {
      const errorMessage =
        err?.shortMessage || err?.message || "Failed to end auction";
      toast.error(errorMessage, { id: "endAuction" });
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Auction ended! 🔓", { id: "endAuction" });
    }
    if (error) {
      toast.error(
        error.shortMessage || error.message || "Transaction failed",
        { id: "endAuction" }
      );
    }
  }, [isSuccess, error]);

  return {
    endAuction,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const bid = async (vaultId: bigint, bidAmount: bigint): Promise<{ success: boolean; outbid?: boolean }> => {
    try {
      const txHash = await writeContract({
        address: contractAddress,
        abi,
        functionName: "bid",
        args: [vaultId],
        value: bidAmount,
      });
      toast.loading("Bid submitted...", { id: "bid" });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.shortMessage || err?.message || "Bid failed";
      // Check if it's an outbid error (bid must be +1)
      const isOutbid = errorMessage.toLowerCase().includes("bid must be") || 
                       errorMessage.toLowerCase().includes("outbid");
      
      if (isOutbid) {
        toast.error("You were outbid", { id: "bid" });
        return { success: false, outbid: true };
      }
      
      toast.error(errorMessage, { id: "bid" });
      return { success: false, outbid: false };
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Bid placed successfully! 🎉", { id: "bid" });
    }
    if (error) {
      const errorMessage = error.shortMessage || error.message || "Transaction failed";
      const isOutbid = errorMessage.toLowerCase().includes("bid must be") || 
                       errorMessage.toLowerCase().includes("outbid");
      
      if (isOutbid) {
        toast.error("You were outbid", { id: "bid" });
      } else {
        toast.error(errorMessage, { id: "bid" });
      }
    }
  }, [isSuccess, error]);

  return {
    bid,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useCreateVault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createVault = async (
    nftAddresses: `0x${string}`[],
    tokenIds: bigint[]
  ) => {
    try {
      const txHash = await writeContract({
        address: contractAddress,
        abi,
        functionName: "createVault",
        args: [nftAddresses, tokenIds],
      });
      toast.loading("Creating vault...", { id: "createVault" });
      return txHash;
    } catch (err: any) {
      const errorMessage =
        err?.shortMessage || err?.message || "Vault creation failed";
      toast.error(errorMessage, { id: "createVault" });
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Vault created successfully! 🔒", { id: "createVault" });
    }
    if (error) {
      toast.error(
        error.shortMessage || error.message || "Transaction failed",
        { id: "createVault" }
      );
    }
  }, [isSuccess, error]);

  return {
    createVault,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useStartAuction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const startAuction = async (
    vaultId: bigint,
    startPrice: string,
    duration: bigint
  ) => {
    try {
      const txHash = await writeContract({
        address: contractAddress,
        abi,
        functionName: "startAuction",
        args: [vaultId, parseEther(startPrice), duration],
      });
      toast.loading("Starting auction...", { id: "startAuction" });
      return txHash;
    } catch (err: any) {
      const errorMessage =
        err?.shortMessage || err?.message || "Failed to start auction";
      toast.error(errorMessage, { id: "startAuction" });
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Auction started! 🚀", { id: "startAuction" });
    }
    if (error) {
      toast.error(
        error.shortMessage || error.message || "Transaction failed",
        { id: "startAuction" }
      );
    }
  }, [isSuccess, error]);

  return {
    startAuction,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useApproveNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveNFT = async (nftAddress: `0x${string}`) => {
    try {
      // ERC721 setApprovalForAll
      const erc721Abi = [
        {
          inputs: [
            { name: "operator", type: "address" },
            { name: "approved", type: "bool" },
          ],
          name: "setApprovalForAll",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const txHash = await writeContract({
        address: nftAddress,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [contractAddress, true],
      });
      toast.loading("Approving NFTs...", { id: "approve" });
      return txHash;
    } catch (err: any) {
      const errorMessage =
        err?.shortMessage || err?.message || "Approval failed";
      toast.error(errorMessage, { id: "approve" });
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("NFTs approved! ✅", { id: "approve" });
    }
    if (error) {
      toast.error(
        error.shortMessage || error.message || "Transaction failed",
        { id: "approve" }
      );
    }
  }, [isSuccess, error]);

  return {
    approveNFT,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}


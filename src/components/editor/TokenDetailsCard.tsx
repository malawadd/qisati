import { useState, useRef, useEffect } from "react";
import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { baseSepolia } from "viem/chains";

// Utility: Map symbol to emoji (customize as you like)
const TOKEN_EMOJI: Record<string, string> = {
  ETH: "💎",
  BTC: "🟧",
  ZORA: "🟣",
  USDC: "🟦",
  // Add more symbols as needed
};

function getTokenEmoji(symbol?: string): string {
  if (!symbol) return "💠";
  return TOKEN_EMOJI[symbol.toUpperCase()] || "💠";
}

interface TokenDetailsCardProps {
  address: string;
  chainId?: number; // optional, default to base.id
}

setApiKey("zora_api_72d59b31522a476bd571b9c53c9321dc679d44103c498386c8957f3a202c4a0b"); // Set your Zora API key here


export default function TokenDetailsCard({ address, chainId }: TokenDetailsCardProps) {
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
  
    // Fetch token info asynchronously
    useEffect(() => {
      let cancelled = false;
      async function fetchToken() {
        setLoading(true);
        setError(null);
        setToken(null);
        try {
          const response = await getCoin({
            address,
            chain: chainId ?? baseSepolia.id,
          });
          const coin = response.data?.zora20Token;
          if (!cancelled) {
            if (coin) setToken(coin);
            else setError("Token not found.");
          }
        } catch (err) {
          if (!cancelled) setError("Failed to fetch token.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
      void fetchToken();
      return () => { cancelled = true; };
    }, [address, chainId]);
  
    // Close modal when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      if (open) document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);
  
    // Format createdAt date if present
    const createdAt = token?.createdAt
      ? new Date(token.createdAt).toLocaleDateString()
      : "—";
  
    // Main card
    if (loading) {
      return (
        <div className="neo bg-white border-4 border-black rounded-lg p-6 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="animate-pulse text-gray-400">Loading...</span>
        </div>
      );
    }
    if (error || !token) {
      return (
        <div className="neo bg-white border-4 border-black rounded-lg p-6 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-2xl">⚠️</span>
          <span className="text-red-600 font-bold">{error || "Token not found"}</span>
        </div>
      );
    }
  
    return (
      <>
        <button
          className="neo bg-white border-4 border-black rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
          onClick={() => setOpen(true)}
        >
          <span className="text-5xl mb-2">
            {getTokenEmoji(token.symbol)}
          </span>
          <span className="font-bold text-xl text-black">{token.name}</span>
          <span className="text-gray-500 text-sm">Created: {createdAt}</span>
        </button>
        {open && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 transition-all">
            <div
              ref={modalRef}
              className="neo bg-white border-4 border-black rounded-2xl shadow-xl p-8 max-w-md w-full relative animate-in fade-in"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 bg-black text-white rounded-full px-3 py-1 text-sm font-bold hover:bg-gray-800 transition"
              >
                Close
              </button>
              <div className="flex flex-col items-center gap-2 mb-6">
                <span className="text-6xl">{getTokenEmoji(token.symbol)}</span>
                <span className="font-bold text-2xl text-black">{token.name} <span className="text-gray-500 text-xl">{token.symbol}</span></span>
              </div>
              <div className="text-black space-y-2">
                {/* {token.mediaContent?.previewImage && (
                  <img src={token.mediaContent.previewImage} alt="Token preview" className="rounded-xl mb-4 w-full border-2 border-black" />
                )} */}
                <div><span className="font-bold">address:</span> {address|| "—"}</div>
                <div><span className="font-bold">Description:</span> {token.description || "—"}</div>
                <div><span className="font-bold">Total Supply:</span> {token.totalSupply}</div>
                <div><span className="font-bold">Market Cap:</span> {token.marketCap || "—"}</div>
                <div><span className="font-bold">24h Volume:</span> {token.volume24h || "—"}</div>
                <div><span className="font-bold">Creator:</span> {token.creatorAddress || "—"}</div>
                <div><span className="font-bold">Created At:</span> {createdAt}</div>
                <div><span className="font-bold">Unique Holders:</span> {token.uniqueHolders ?? "—"}</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
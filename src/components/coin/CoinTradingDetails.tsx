import { useEffect, useState } from "react";
import { getCoin, setApiKey } from "@zoralabs/coins-sdk";
import { baseSepolia } from "viem/chains";

// Small avatar utility if you want initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

setApiKey("zora_api_72d59b31522a476bd571b9c53c9321dc679d44103c498386c8957f3a202c4a0b");

export default function CoinTradingDetails({ address }: { address: string }) {
  const [coin, setCoin] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getCoin({ address:address, chain: baseSepolia.id });
      console.log("Coin details:", res.data?.zora20Token);
      if (!cancelled && res.data?.zora20Token) setCoin(res.data.zora20Token);
    })();
    return () => { cancelled = true; };
  }, [address]);

      


  if (!coin) {
    return (
      <div className="neo bg-white border-4 border-black rounded-xl p-8 w-full flex flex-col items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="animate-pulse text-gray-400 text-lg">Loading coin details…</div>
      </div>
    );
  }

  return (
    <div className="neo bg-white border-4 border-black rounded-xl p-8 w-full flex flex-col items-start gap-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Top row: Avatar and basic details */}
      <div className="flex items-center gap-4">
        {/* Avatar (emoji or fallback circle with initials) */}
        {coin.mediaContent?.previewImage.small ? (
          <img
            src={coin.mediaContent.previewImage.small}
            alt={coin.symbol}
            className="w-14 h-14 rounded-full border-2 border-black bg-gray-100 object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center font-bold text-2xl text-black">
            {coin.symbol?.length === 1
              ? coin.symbol
              : getInitials(coin.name || coin.symbol)}
          </div>
        )}

        <div>
          <div className="font-bold text-2xl text-black leading-tight">
            {coin.name || "—"}
          </div>
          <div className="text-md text-gray-700">{coin.symbol}</div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="font-bold text-xl text-black mb-1">About This Series</div>
        <div className="text-gray-600 text-md">
          {coin.description || <span className="italic text-gray-400">No description</span>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 mt-2">
        <div className="flex flex-col items-start px-2">
          <div className="text-xs text-gray-500 mb-0.5">Market Cap</div>
          <div className="font-bold text-lg text-black">
            {coin.marketCap === undefined ? (
              <span className="text-gray-400">NEW</span>
            ) : (
              `$${Number(coin.marketCap).toLocaleString()}`
            )}
          </div>
        </div>
        <div className="flex flex-col items-start px-2">
          <div className="text-xs text-gray-500 mb-0.5">24H Volume</div>
          <div className="font-bold text-lg text-black">
            {coin.volume24h === undefined
              ? "$0"
              : `$${Number(coin.volume24h).toLocaleString()}`}
          </div>
        </div>
        <div className="flex flex-col items-start px-2">
          <div className="text-xs text-gray-500 mb-0.5">Creator Earnings</div>
          <div className="font-bold text-lg text-black">
            {/* This field is always $0 for now, adjust as needed */}
            $0
          </div>
        </div>
      </div>
    </div>
  );
}

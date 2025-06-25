interface CoinData {
  name: string;
  symbol: string;
  marketCap?: string | number;
  volume24h?: string | number;
  creatorEarnings?: string | number;
  uniqueHolders?: string | number;
}

interface CoinStatsCardProps {
  coin: CoinData | null;
}

export function CoinStatsCard({ coin }: CoinStatsCardProps) {
  if (!coin) return null;

  const formatNumber = (num: number | string | undefined) => {
    if (!num) return "—";
    return typeof num === "string" ? num : num.toLocaleString();
  };

  return (
    <div className="neo bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{coin.name}</h3>
        <span className="text-lg font-mono">{coin.symbol}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600">Market Cap</div>
          <div className="font-bold">${formatNumber(coin.marketCap)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">24h Volume</div>
          <div className="font-bold">${formatNumber(coin.volume24h)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Creator Earnings</div>
          <div className="font-bold">${formatNumber(coin.creatorEarnings)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Holders</div>
          <div className="font-bold">{formatNumber(coin.uniqueHolders)}</div>
        </div>
      </div>
    </div>
  );
}
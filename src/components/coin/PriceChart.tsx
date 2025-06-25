import { VictoryLine, VictoryChart, VictoryAxis } from "victory";

interface CoinData {
  name: string;
  symbol: string;
  marketCap?: string | number;
  volume24h?: string | number;
  creatorEarnings?: string | number;
  uniqueHolders?: string | number;
}

interface PriceChartProps {
  coin: CoinData | null;
}

export function PriceChart({ coin }: PriceChartProps) {
  // For now using mock data - would be replaced with real price history
  const mockData = Array.from({ length: 24 }, (_, i) => ({
    x: i,
    y: Math.random() * 0.5 + 0.5,
  }));

  if (!coin) return null;

  if (!mockData.length) {
    return (
      <div className="neo bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-[200px] flex items-center justify-center">
        <p className="text-gray-600 font-medium">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="neo bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <VictoryChart height={200} padding={{ top: 20, right: 20, bottom: 30, left: 40 }}>
        <VictoryAxis 
          dependentAxis
          style={{
            axis: { stroke: "#000" },
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
        <VictoryAxis 
          style={{
            axis: { stroke: "#000" },
            tickLabels: { fontSize: 10, padding: 5 }
          }}
        />
        <VictoryLine
          data={mockData}
          style={{
            data: { stroke: "#000", strokeWidth: 2 }
          }}
          animate={{
            duration: 500,
            onLoad: { duration: 500 }
          }}
        />
      </VictoryChart>
    </div>
  );
}
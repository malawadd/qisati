// import CoinDetailsCard from "./CoinDetailsCard";
import TradingChart from "./TradingChart";
import BuySellTabs from "./BuySellTabs";
import CoinTradingDetails from "./CoinTradingDetails";


export default function TradingScreen({ coinAddress, userAddress }: { coinAddress: string; userAddress: string }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch min-h-[540px]">
      {/* Chart on the left, takes full height */}
      <div className="h-full">
        <TradingChart address={coinAddress} className="h-full min-h-[540px]" />
      </div>
      {/* Right side: coin details + buy/sell vertically stacked */}
      <div className="flex flex-col gap-6 h-full">
        <CoinTradingDetails address={coinAddress} />
        <BuySellTabs coinAddress={coinAddress} userAddress={userAddress} />
      </div>
    </div>
  );
}

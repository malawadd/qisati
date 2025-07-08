// import CoinDetailsCard from "./CoinDetailsCard";
import TradingChart from "./TradingChart";
import BuySellTabs from "./BuySellTabs";
import CoinTradingDetails from "./CoinTradingDetails";


export default function TradingScreen({ coinAddress, userAddress }: { coinAddress: string; userAddress: string }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
   
    <CoinTradingDetails address={coinAddress} />

   
    <a
      href={`https://testnet.zora.co/coin/bsep:${coinAddress}`}
      target="_blank"
      rel="noopener noreferrer"
      className="
    mt-6
    inline-flex
    items-center
    justify-center
    px-8 py-4
    bg-white
    text-black
    text-xl
    font-extrabold
    border-4
    border-black
    rounded-xl
    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
    transition
    hover:-translate-y-1
    hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
    active:translate-y-0
    active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    select-none
    gap-2
  "
      style={{ letterSpacing: "0.02em" }}
    >
      🚀 Trade this coin on Zora ↗
    </a>
  </div>
  );
}

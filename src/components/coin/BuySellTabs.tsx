import { useState } from "react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";


export default function BuySellTabs({ coinAddress, userAddress }: { coinAddress: string; userAddress: string }) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  return (
    <div className="neo bg-white border-4 border-black rounded-lg p-6">
      <div className="flex mb-4">
        <button
          onClick={() => setTab("buy")}
          className={`flex-1 px-4 py-2 font-bold ${tab === "buy" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
        >
          Buy
        </button>
        <button
          onClick={() => setTab("sell")}
          className={`flex-1 px-4 py-2 font-bold ${tab === "sell" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
        >
          Sell
        </button>
      </div>
      {tab === "buy" ? (
        <BuyForm coinAddress={coinAddress} userAddress={userAddress} />
      ) : (
        <SellForm coinAddress={coinAddress} userAddress={userAddress} />
      )}
    </div>
  );
}

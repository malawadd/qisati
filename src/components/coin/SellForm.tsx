import { useState } from "react";
// import { tradeCoinCall } from "@zoralabs/coins-sdk";
// import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Address, parseEther } from "viem";

export default function SellForm({ coinAddress, userAddress }: { coinAddress: string; userAddress: string }) {
  const [amount, setAmount] = useState("0.01");

  const tradeParams = {
    direction: "sell" as const,
    target: coinAddress as Address,
    args: {
      recipient: userAddress as Address,
      orderSize: parseEther(amount), // Update to use token decimals if needed
      minAmountOut: 0n,
      tradeReferrer: "0x0000000000000000000000000000000000000000" as Address,
    }
  };

//   const contractCallParams = tradeCoinCall(tradeParams);

//   const { config } = usePrepareContractWrite({
//     ...contractCallParams,
//   });

//   const { write: writeContract, status } = useContractWrite(config);

  return (
    <form
    //   onSubmit={e => {
    //     e.preventDefault();
    //     writeContract?.();
    //   }}
      className="flex flex-col gap-4"
    >
      <input
        type="number"
        min="0"
        step="0.0001"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border-2 border-black rounded px-3 py-2 font-mono"
        placeholder="Token amount"
      />
      <button
        type="submit"
        disabled={true}
        className="bg-red-500 text-white font-bold py-2 rounded  disabled:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'pending' ? 'Selling...' : 'Sell Coin'}
      </button>
    </form>
  );
}

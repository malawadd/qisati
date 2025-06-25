import { useState } from "react";
// import { tradeCoinCall } from "@zoralabs/coins-sdk";
// import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { Address, parseEther } from "viem";

export default function BuyForm({ coinAddress, userAddress }: { coinAddress: string; userAddress: string }) {
  const [amount, setAmount] = useState("0.01");
  const [pending, setPending] = useState(true);

//   const tradeParams = {
//     direction: "buy" as const,
//     target: coinAddress as Address,
//     args: {
//       recipient: userAddress as Address,
//       orderSize: parseEther(amount),
//       minAmountOut: 0n,
//       tradeReferrer: "0x0000000000000000000000000000000000000000" as Address,
//     }
//   };

//   const contractCallParams = tradeCoinCall(tradeParams);

//   const { config } = usePrepareContractWrite({
//     ...contractCallParams,
//     value: tradeParams.args.orderSize,
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
        placeholder="ETH amount"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-green-500 text-white font-bold py-2 rounded disabled:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'pending' ? 'Buying...' : 'Buy Coin'}
      </button>
    </form>
  );
}

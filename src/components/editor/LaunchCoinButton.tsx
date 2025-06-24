/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-misused-promises */


import { useState } from "react";
import { createCoinCall, DeployCurrency , ValidMetadataURI, getCoinCreateFromLogs } from "@zoralabs/coins-sdk";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { baseSepolia } from "viem/chains";
import { Address } from "viem";

import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

type LaunchCoinButtonProps = {
  series: Doc<"series">;
  sessionId: Id<"walletSessions">;
};

export default function LaunchCoinButton({
  series,
  sessionId,
}: LaunchCoinButtonProps) {
  /* ---------------- state ---------------- */
  const [status, setStatus] = useState<
    "idle" | "upload" | "sign" | "tx" | "done"
  >("idle");
  const [desc] = useState(series.synopsisMd ?? "");
  const [symbol] = useState(
    series.title.replace(/\W+/g, "").slice(0, 5).toUpperCase()
  );

  /* ---------------- hooks ---------------- */
  const { address } = useAccount();                       // user wallet
  const { writeContractAsync } = useWriteContract();      // tx sender
  const publicClient = usePublicClient();                 // wait for receipt

  const uploadjson = useAction(api.uploadipfs.uploadJSONToIPFS);
  const updateSeriesMeta = useMutation(
    api.seriesMutations.updateSeriesMeta
  );

  /* ---------------- click handler ---------------- */
  const handleLaunch = async () => {
    try {
      /* 1️⃣  upload metadata JSON to IPFS */
      setStatus("upload");
      const metadata = {
        name: `${series.title} Coin`,
        description: desc,
        image: series.coverUrl,
        properties: { category: series.category ?? "social" },
      };
      const cid: string = await uploadjson({ data: metadata });
      console.log("Metadata uploaded to IPFS:", cid);
      const uri = `ipfs://${cid}`;

      /* 2️⃣  build call data with Zora SDK */
      const coinParams = {
        name: `${series.title} Coin`,
        symbol,
        uri: uri as ValidMetadataURI, // ensure valid URI type
        payoutRecipient: address as Address,
        currency: DeployCurrency.ETH,
        chainId: baseSepolia.id,
      } as const;
        console.log("Coin parameters:", coinParams);

      const call = await createCoinCall(coinParams); // { address, abi, functionName, args }
      console.log("Contract call data:", call);

      /* 3️⃣  sign & broadcast */
      setStatus("sign");
      const hash = await writeContractAsync(call);   // wallet popup

      /* 4️⃣  wait for confirmation */
      setStatus("tx");
      //@ts-ignore
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const deployment = getCoinCreateFromLogs(receipt);
      const coinAddr = deployment?.coin; 
      const poolAddr = deployment?.poolKey;
      console.log("Coin deployed at:", coinAddr);
      console.log("Pool deployed at:", poolAddr);



      /* 5️⃣  persist contract address ↔︎ series */
      await updateSeriesMeta({
        sessionId,
        seriesId: series._id,
        contract: coinAddr,   // coin proxy address
        tokenId: 0,
      });

      setStatus("done");
    } catch (err) {
      console.error("Coin launch failed:", err);
      setStatus("idle");
      alert("Coin launch failed – check the console for details.");
    }
  };

  /* ---------------- UI ---------------- */
  const label = {
    idle: "Launch Story Coin",
    upload: "Uploading…",
    sign: "Await wallet…",
    tx: "Broadcasting…",
    done: "Coin live ✔",
  }[status];

  return (
    <button
      onClick={handleLaunch}
      disabled={status !== "idle" && status !== "done"}
      className="neo bg-[#A589E8] text-white px-6 py-2 font-bold
                 hover:bg-[#8A6AD7] transition-colors disabled:opacity-50"
    >
      {label}
    </button>
  );
}

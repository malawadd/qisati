"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import pinataSDK from "@pinata/sdk";


export const uploadJSONToIPFS = action({
    args: { data: v.any() }, // any valid JSON object
    handler: async (ctx, args) => {
      const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT! });
      const { IpfsHash } = await pinata.pinJSONToIPFS(args.data);
      return IpfsHash;
    }
  });
import { action } from "./_generated/server";
import { v } from "convex/values";


// export const uploadImage = action({
//   args: { base64: v.string() },
//   handler: async (ctx, args) => {
//     // TODO: Replace with real Zora IPFS upload
//     // const response = await zora.uploadFile({
//     //   file: base64ToBlob(args.base64),
//     //   metadata: { type: 'image' }
//     // });
//     // return `https://ipfs.zora.co/ipfs/${response.cid}`;
    
//     // For now, generate a mock IPFS URL
//     const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
//     return `https://ipfs.zora.co/ipfs/${mockCid}`;
//   },
// });

// // Helper function to convert base64 to blob (for future Zora integration)
// function base64ToBlob(base64: string): Blob {
//   const byteCharacters = atob(base64.split(',')[1]);
//   const byteNumbers = new Array(byteCharacters.length);
//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i);
//   }
//   const byteArray = new Uint8Array(byteNumbers);
//   return new Blob([byteArray], { type: 'image/jpeg' });
// }

export const uploadImageToIPFS = action({
    args: {
      file: v.bytes(),      // Uint8Array from the client
      fileName: v.string(), // “photo.png”
      mimeType: v.string(), // “image/png”
    },
    handler: async (ctx, { file, fileName, mimeType }) => {
      console.log("start:", fileName, mimeType);
      const blob = new Blob([file], { type: mimeType });
      const form = new FormData();
      form.append("file", blob, fileName);
      console.log("Uploading to Pinata:", fileName, mimeType);
  
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.PINATA_JWT!}` },
          body: form,
        },
      );
      if (!res.ok) throw new Error(`Pinata upload failed: ${await res.text()}`);
  
      const { IpfsHash } = await res.json();
      console.log("Uploaded to IPFS:", IpfsHash);
      const gateway = "https://gateway.pinata.cloud/ipfs/"; 
      return {
        cid: IpfsHash,
        url: `${gateway}${IpfsHash}`,
      }
    },
  });
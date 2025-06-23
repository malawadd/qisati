import { action } from "./_generated/server";
import { v } from "convex/values";

export const uploadImage = action({
  args: { base64: v.string() },
  handler: async (ctx, args) => {
    // TODO: Replace with real Zora IPFS upload
    // const response = await zora.uploadFile({
    //   file: base64ToBlob(args.base64),
    //   metadata: { type: 'image' }
    // });
    // return `https://ipfs.zora.co/ipfs/${response.cid}`;
    
    // For now, generate a mock IPFS URL
    const mockCid = `Qm${Math.random().toString(36).substring(2, 15)}`;
    return `https://ipfs.zora.co/ipfs/${mockCid}`;
  },
});

// Helper function to convert base64 to blob (for future Zora integration)
function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
}

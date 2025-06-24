/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRef } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
// import { ImageIcon } from 'lucide-react';

interface CoverUploadButtonProps {
  currentCover: string;
  seriesId: Id<"series">;
  sessionId: Id<"walletSessions">;
}

export default function CoverUploadButton({ currentCover, seriesId, sessionId }: CoverUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCover = useAction(api.uploadImage.uploadImageToIPFS);
  const updateMeta = useMutation(api.seriesMutations.updateSeriesMeta);

//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       // Convert to base64
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const base64 = reader.result as string;
        
//         // Upload to storage
//         const coverCid = await uploadCover({ base64 });
        
//         // Update series metadata
//         await updateMeta({
//           sessionId,
//           seriesId,
//           coverCid
//         });
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error('Failed to upload cover:', error);
//       alert('Failed to upload cover image. Please try again.');
//     }
//   };

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      const arrayBuf = await file.arrayBuffer();      // <-- no FileReader needed
      const bytes = new Uint8Array(arrayBuf);         // Uint8Array for v.bytes()
      console.log("Uploading cover image:", file.name, file.type, bytes.length);
      console.log("uploadCover", uploadCover);
      console.log("updateMeta", updateMeta);
  
      const coverCid = await uploadCover({
        file: arrayBuf,
        fileName: file.name,
        mimeType: file.type,          // pass MIME so backend can set Blob type
      });
  
      await updateMeta({ sessionId:sessionId, seriesId:seriesId, coverCid:coverCid.url });
    } catch (err) {
      console.error("Failed to upload cover:", err);
      alert("Upload failed—please try again.");
    }
  };
  

  return (
    <div className="space-y-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-full px-4 py-3
          neo
          bg-white
          border-4 border-black
          shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          rounded-sm
          font-bold
          text-black
          hover:bg-gray-50
          active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          active:translate-x-[2px]
          active:translate-y-[2px]
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          focus:ring-offset-2
          focus:ring-offset-white
          transition-all
          flex items-center justify-center gap-2
        `}
      >
        {/* <ImageIcon className="w-5 h-5" /> */}
        Upload Cover Image
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {currentCover && (
        <div className="neo bg-gray-100 p-2">
          <img
            src={currentCover}
            alt="Current cover"
            className="w-32 h-32 object-cover neo"
          />
        </div>
      )}
    </div>
  );
}
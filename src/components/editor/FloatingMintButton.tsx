import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface FloatingMintButtonProps {
  chapterId: Id<"chapters">;
  sessionId: Id<"walletSessions">;
}

export default function FloatingMintButton({ chapterId, sessionId }: FloatingMintButtonProps) {
  const [isMinting, setIsMinting] = useState(false);
  const mintChapter = useAction(api.mintChapter.mintChapter);

  const handleMint = async () => {
    if (!sessionId) {
      alert('Please connect your wallet before minting.');
      return;
    }

    setIsMinting(true);
    
    try {
      const result = await mintChapter({
        sessionId,
        chapterId,
        size: 100,        // Predetermined size
        price: 0.002,     // Predetermined price
        splits: []        // No splits
      });
      
      if (result.success) {
        alert(`Chapter minted successfully! Token ID: ${result.tokenId}`);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={isMinting}
      className="fixed bottom-20 right-6 fab hover:scale-110 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-40"
      title={isMinting ? 'Minting...' : 'Mint Chapter (100 editions, 0.002 ETH)'}
    >
      {isMinting ? (
        <div className="animate-spin">⏳</div>
      ) : (
        <div className="text-xl">🪙</div>
      )}
    </button>
  );
}
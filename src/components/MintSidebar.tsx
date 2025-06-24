/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Editor } from '@tiptap/react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PrimaryButton } from './atoms/PrimaryButton';
import { GhostButton } from './atoms/GhostButton';


interface MintSidebarProps {
  chapterId: string;
  editor: Editor | null;
  sessionId: string; // <-- Add sessionId prop!
}

interface MintFormData {
  size: number;
  price: number;
  splits: Array<{ address: string; percentage: number }>;
}

interface RoyaltySplit {
  address: string;
  percentage: number;
}

export default function MintSidebar({ chapterId, editor, sessionId }: MintSidebarProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [splits, setSplits] = useState<RoyaltySplit[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const mintChapter = useAction(api.mintChapter.mintChapter);

  const { register, handleSubmit, watch, setValue } = useForm<MintFormData>({
    defaultValues: {
      size: 100,
      price: 0.002,
      splits: []
    }
  });

  const watchedSize = watch('size');
  const watchedPrice = watch('price');

  const getWordCount = () => {
    if (!editor) return 0;
    return editor.storage.characterCount?.words() || 0;
  };

  const getFirstImage = () => {
    if (!editor) return null;
    const doc = editor.getJSON();
    const findImage = (node: any): string | null => {
      if (node.type === 'image' && node.attrs?.src) {
        return node.attrs.src;
      }
      if (node.content) {
        for (const child of node.content) {
          const img = findImage(child);
          if (img) return img;
        }
      }
      return null;
    };
    return findImage(doc);
  };

  const addSplit = () => {
    setSplits([...splits, { address: '', percentage: 0 }]);
  };

  const updateSplit = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const getTotalPercentage = () => {
    return splits.reduce((sum, split) => sum + split.percentage, 0);
  };

  const onSubmit = async (data: MintFormData) => {
    const totalPercentage = getTotalPercentage();
    if (splits.length > 0 && totalPercentage !== 100) {
      alert('Royalty splits must total 100%');
      return;
    }

    if (!sessionId) {
      alert('Please connect your wallet before minting.');
      return;
    }

    setIsMinting(true);
    // Ensure chapterId is a valid string
    console.log('Minting chapter with ID:', sessionId);
  
    try {
      const result = await mintChapter({
        sessionId, // <-- Pass sessionId here
        chapterId: chapterId as any,
        size: isUnlimited ? 999999 : data.size,
        price: data.price,
        splits: splits.filter(s => s.address && s.percentage > 0)
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


  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="neo bg-white p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-black mb-4">NFT Preview</h3>
        
        <div className="neo bg-gray-100 p-4 mb-4">
          <img 
            src={getFirstImage() || 'https://picsum.photos/300/200?random=1'} 
            alt="Chapter cover"
            className="w-full h-32 object-cover neo mb-3"
          />
          <div className="text-sm text-black space-y-1">
            <div><strong>Word Count:</strong> {getWordCount().toLocaleString()}</div>
            <div><strong>Edition Size:</strong> {isUnlimited ? 'Unlimited' : watchedSize.toLocaleString()}</div>
            <div><strong>Price:</strong> {watchedPrice} ETH</div>
            {splits.length > 0 && (
              <div>
                <strong>Royalty Splits:</strong>
                <ul className="text-xs mt-1">
                  {splits.map((split, i) => (
                    <li key={i}>{split.address.slice(0, 8)}... - {split.percentage}%</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <GhostButton onClick={() => setShowPreview(false)}>
            Close
          </GhostButton>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-80 p-6 bg-white border-l-4 border-black overflow-y-auto">
        <h2 className="text-xl font-bold text-black mb-6">Mint Chapter</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Edition Size
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-black">Unlimited</span>
              </div>
              {!isUnlimited && (
                <input
                  type="range"
                  min="1"
                  max="10000"
                  {...register('size', { valueAsNumber: true })}
                  className="w-full"
                />
              )}
              <div className="text-sm text-black">
                {isUnlimited ? 'Unlimited' : `${watchedSize.toLocaleString()} editions`}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Price (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              {...register('price', { valueAsNumber: true })}
              className="neo bg-white w-full px-3 py-2 text-black font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Co-author Splits
            </label>
            <div className="text-xs text-gray-600 mb-2">
              Add collaborators who will receive royalties
            </div>
            
            {splits.map((split, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={split.address}
                  onChange={(e) => updateSplit(index, 'address', e.target.value)}
                  className="neo bg-white flex-1 px-2 py-1 text-xs"
                />
                <input
                  type="number"
                  placeholder="%"
                  min="0"
                  max="100"
                  value={split.percentage}
                  onChange={(e) => updateSplit(index, 'percentage', parseInt(e.target.value) || 0)}
                  className="neo bg-white w-16 px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeSplit(index)}
                  className="neo bg-red-100 px-2 py-1 text-xs font-bold hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSplit}
              className="neo bg-gray-100 w-full px-3 py-2 text-sm font-bold hover:bg-gray-200 mb-2"
            >
              + Add Split
            </button>
            
            {splits.length > 0 && (
              <div className={`text-xs ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                Total: {getTotalPercentage()}% {getTotalPercentage() !== 100 && '(must equal 100%)'}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <GhostButton 
              onClick={() => setShowPreview(true)}
              className="w-full"
              type="button"
            >
              Preview NFT
            </GhostButton>
            
            <PrimaryButton 
              className="w-full" 
              disabled={isMinting}
              type="submit"
            >
              {isMinting ? 'Minting...' : 'Mint Chapter'}
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black">
          <div className="text-xs text-gray-600 space-y-1">
            <div>Word count: {getWordCount().toLocaleString()}</div>
            <div>Auto-saved</div>
          </div>
        </div>
      </div>

      {showPreview && <PreviewModal />}
    </>
  );
}

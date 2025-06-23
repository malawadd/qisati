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
}

interface MintFormData {
  size: number;
  price: number;
  splits: Array<{ address: string; percentage: number }>;
}

export default function MintSidebar({ chapterId, editor }: MintSidebarProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);
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
    const text = editor.getText();
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getFirstImage = () => {
    if (!editor) return null;
    const doc = editor.getJSON();
    // Find first image in the document
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

  const onSubmit = async (data: MintFormData) => {
    try {
      const result = await mintChapter({
        chapterId: chapterId as any,
        size: isUnlimited ? 999999 : data.size,
        price: data.price,
        splits: data.splits.filter(s => s.address && s.percentage > 0)
      });
      
      if (result.success) {
        alert(`Chapter minted successfully! Token ID: ${result.tokenId}`);
      }
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    }
  };

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="neo bg-white p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-black mb-4">NFT Preview</h3>
        
        <div className="neo bg-gray-100 p-4 mb-4">
          <img 
            src={getFirstImage() || 'https://picsum.photos/300/200?random=1'} 
            alt="Chapter cover"
            className="w-full h-32 object-cover neo mb-3"
          />
          <div className="text-sm text-black">
            <div><strong>Word Count:</strong> {getWordCount()}</div>
            <div><strong>Edition Size:</strong> {isUnlimited ? 'Unlimited' : watchedSize}</div>
            <div><strong>Price:</strong> {watchedPrice} ETH</div>
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
      <div className="w-80 p-6 bg-white border-l-4 border-black">
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
                {isUnlimited ? 'Unlimited' : `${watchedSize} editions`}
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
              Co-author Splits (Optional)
            </label>
            <div className="text-xs text-gray-600 mb-2">
              Add collaborators who will receive royalties
            </div>
            {/* TODO: Add dynamic split inputs */}
            <div className="text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <GhostButton 
              onClick={() => setShowPreview(true)}
              className="w-full"
            >
              Preview NFT
            </GhostButton>
            
            <PrimaryButton className="w-full">
              Mint Chapter
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black">
          <div className="text-xs text-gray-600 space-y-1">
            <div>Word count: {getWordCount()}</div>
            <div>Auto-saved</div>
          </div>
        </div>
      </div>

      {showPreview && <PreviewModal />}
    </>
  );
}

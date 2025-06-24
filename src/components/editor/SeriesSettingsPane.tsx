import { Doc } from '../../../convex/_generated/dataModel';
import TitleInput from './TitleInput';
import DescriptionInput from './DescriptionInput';
import CoverUploadButton from './CoverUploadButton';
import LoglineInput from './LoglineInput';
import { Id } from '../../../convex/_generated/dataModel';
import CategorySelector from './CategorySelector';
import LaunchCoinButton from './LaunchCoinButton';

interface SeriesSettingsPaneProps {
  series: Doc<"series">;
  chapters: Doc<"chapters">[];
  sessionId: Id<"walletSessions">;
}

export default function SeriesSettingsPane({ series, chapters, sessionId }: SeriesSettingsPaneProps) {
  const hasLiveChapter = chapters.some(ch => ch.status === 'live');
  
  return (
    <div className="p-6 flex gap-6">
      {/* Settings Form */}
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <label className="block font-bold text-sm">Series Title</label>
          <TitleInput
            title={series.title}
            seriesId={series._id}
            sessionId={sessionId}
            disabled={hasLiveChapter}
          />
          {hasLiveChapter && (
            <p className="text-sm text-gray-600">
              Series title cannot be changed after publishing
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-sm">log Line</label>
          <LoglineInput
            logline={series.logline}
            seriesId={series._id}
            sessionId={sessionId}
          />
          
        </div>


        <div className="space-y-2">
          <label className="block font-bold text-sm">Description</label>
          <DescriptionInput
            description={series.synopsisMd}
            seriesId={series._id}
            sessionId={sessionId}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-sm">Category</label>
          <CategorySelector
            category={series.category}
            seriesId={series._id}
            sessionId={sessionId}
            />
        </div>



        

        <div className="space-y-2">
          <label className="block font-bold text-sm">Cover Image</label>
          <CoverUploadButton
            currentCover={series.coverUrl}
            seriesId={series._id}
            sessionId={sessionId}
          />
        </div>

        {series.contract === "0x0000000000000000000000000000000000000000" && (
          <div className="mt-6">
            <LaunchCoinButton series={series} sessionId={sessionId} />
          </div>
        )}
      </div>

      {/* Preview Card */}
      <div className="w-72 shrink-0">
        <div className="neo bg-white p-4">
          <h3 className="font-bold mb-4">Live Preview</h3>
          <div className="aspect-[2/3] mb-4">
            <img 
              src={series.coverUrl} 
              alt={series.title}
              className="w-full h-full object-cover neo"
            />
          </div>
          <h4 className="font-bold mb-2">{series.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            
            {series.logline || 'No logline provided'}
          </p>

          <p className="text-sm text-gray-600 line-clamp-3">
            
            {series.synopsisMd}
          </p>
        </div>
      </div>
    </div>
  );
}
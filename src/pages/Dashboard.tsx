import { useState } from 'react';
import NavBar from '../components/NavBar';
import { MetricTile } from '../components/atoms/MetricTile';
import { GhostButton } from '../components/atoms/GhostButton';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { DraftCard } from '../components/DraftCard';
import { LiveChapterCard } from '../components/LiveChapterCard';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'live'>('drafts');
  const dashboard = useQuery(api.dashboard.authorDashboard);
  const withdraw = useMutation(api.dashboard.withdrawRewards);

  const handleWithdraw = async () => {
    try {
      await withdraw({});
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  if (!dashboard) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen grid-bg flex items-center justify-center">
          <div className="neo bg-white p-8">
            <div className="text-black font-bold">Loading dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">
        {/* Header */}
        <div className="neo bg-white mx-8 mt-4 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">Welcome, Writer</h1>
            <MetricTile value={`${dashboard.earnings.toFixed(3)} ETH`} label="Total Earnings" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-8 mt-4 flex gap-2">
          <GhostButton 
            onClick={() => setActiveTab('drafts')}
            className={activeTab === 'drafts' ? 'bg-primary text-white' : ''}
          >
            Drafts ({dashboard.drafts.length})
          </GhostButton>
          <GhostButton 
            onClick={() => setActiveTab('live')}
            className={activeTab === 'live' ? 'bg-primary text-white' : ''}
          >
            Live ({dashboard.liveChapters.length})
          </GhostButton>
        </div>

        {/* Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {activeTab === 'drafts' ? (
              dashboard.drafts.map(draft => (
                <DraftCard key={draft._id} {...draft} />
              ))
            ) : (
              dashboard.liveChapters.map(chapter => (
                <LiveChapterCard key={chapter._id} {...chapter} />
              ))
            )}
          </div>

          {/* Withdraw Panel */}
          <div className="neo bg-white p-6 max-w-md">
            <h3 className="font-bold text-lg text-black mb-4">Withdraw Earnings</h3>
            <div className="text-2xl font-bold text-black mb-4">
              {dashboard.earnings.toFixed(3)} ETH
            </div>
            <PrimaryButton onClick={handleWithdraw} disabled={dashboard.earnings === 0}>
              Withdraw
            </PrimaryButton>
          </div>
        </main>
      </div>
    </>
  );
}

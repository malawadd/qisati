import NavBar from '../components/NavBar';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { GhostButton } from '../components/atoms/GhostButton';
import { MetricTile } from '../components/atoms/MetricTile';
import { StoryCard } from '../components/StoryCard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function Landing() {
  const stats = useQuery(api.queries.homeStats);
  const stories = useQuery(api.queries.exploreFeed, { page: 1 });

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">

      <section className="min-h-screen flex items-center px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black text-black mb-6 leading-tight">
              Read.<br />Collect.<br />Own.
            </h1>
            <p className="text-xl text-black mb-8 font-medium">
              Discover exclusive stories, collect limited editions, and support your favorite authors directly.
            </p>
            <div className="flex gap-4">
              <PrimaryButton>Start writing</PrimaryButton>
              <GhostButton>Explore</GhostButton>
            </div>
          </div>
          <div className="neo bg-primary h-96 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">Illustration Placeholder</span>
          </div>
        </div>
      </section>

      <section className="neo bg-white py-4 mx-8 mb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8">
          {stats && (
            <>
              <MetricTile value={stats.stories} label="Stories" />
              <MetricTile value={stats.authors} label="Authors" />
              <MetricTile value={stats.collectors} label="Collectors" />
              <MetricTile value={stats.volume} label="Volume" />
            </>
          )}
        </div>
      </section>

      <section className="px-8 pb-16">
        <h2 className="text-3xl font-bold text-black mb-8 text-center">Featured Stories</h2>
        <div className="flex gap-6 justify-center overflow-x-auto pb-4">
          {stories?.map(story => (
            <StoryCard 
              key={story.id} 
              {...story} 
              onClick={() => window.location.href = `/work/digital-nomad`}
            />
          ))}
        </div>
      </section>
      </div>
    </>
  );
}

import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreGrid } from '../components/ExploreGrid';

export function Explore() {
  return (
    <div className="min-h-screen grid-bg">
      <ExploreHeader />
      <ExploreGrid />
    </div>
  );
}

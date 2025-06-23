import NavBar from '../components/NavBar';
import { ExploreGrid } from '../components/ExploreGrid';

export function Explore() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">
        <ExploreGrid />
      </div>
    </>
  );
}

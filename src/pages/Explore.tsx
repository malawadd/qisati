import { useState } from 'react';
import { StoryCard } from '../components/StoryCard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  
  const genres = ['all', 'sci-fi', 'fantasy', 'thriller', 'romance', 'mystery'];
  const stories = useQuery(api.queries.exploreFeed, { page: 1 });

  return (
    <div className="min-h-screen grid-bg">
      <nav className="neo bg-white mx-8 mt-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="font-bold text-xl text-black">ReadOwn</a>
          <div className="flex gap-4">
            <a href="/" className="font-medium text-black hover:text-primary">Home</a>
            <a href="#" className="font-medium text-black hover:text-primary">Docs</a>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo bg-white px-4 py-3 flex-1 text-black font-medium"
          />
          <div className="flex gap-2 flex-wrap">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`neo px-4 py-2 font-bold text-sm transition-colors ${
                  selectedGenre === genre 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {stories?.map((story) => (
            <StoryCard 
              key={story.id} 
              {...story} 
              onClick={() => window.location.href = `/work/digital-nomad`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

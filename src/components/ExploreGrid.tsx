import { useState } from 'react';
import { StoryCard } from './StoryCard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function ExploreGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  
  const genres = ['all', 'sci-fi', 'fantasy', 'thriller', 'romance', 'mystery', 'literary'];
  const stories = useQuery(api.queries.exploreFeed, { 
    page: 1,
    category: selectedGenre,
    search: searchTerm
  });

  return (
    <div className="p-8">
      <div className="neo bg-white p-6 mb-6">
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
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {stories?.map((story) => (
            <StoryCard 
              key={story.id} 
              {...story} 
              onClick={() => window.location.href = `/work/${story.slug}`}
            />
          ))}
        </div>
        
        {(!stories || stories.length === 0) && (
          <div className="text-center py-12">
            <div className="neo bg-white p-8 inline-block">
              <div className="text-black font-bold text-lg mb-2">No stories found</div>
              <div className="text-black">Try adjusting your search or category filter</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Globe, Ghost, Leaf, Youtube, Github, Cloud } from 'lucide-react';

const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: Search },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: Ghost },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: Globe },
  { name: 'Ecosia', url: 'https://www.ecosia.org/search?q=', icon: Leaf },
  { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: Youtube },
  { name: 'GitHub', url: 'https://github.com/search?q=', icon: Github },
  { name: 'SoundCloud', url: 'https://soundcloud.com/search?q=', icon: Cloud },
];

export const SearchBar = () => {
  const [query, setQuery] = useState('');

  const handleSearch = (baseUrl: string) => {
    if (query.trim()) {
      window.open(`${baseUrl}${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Quick Search</h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search..."
          className="brutalist-input font-mono"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(SEARCH_ENGINES[0].url)}
        />
        <div className="grid grid-cols-2 gap-2">
          {SEARCH_ENGINES.map((engine) => (
            <button
              key={engine.name}
              onClick={() => handleSearch(engine.url)}
              className="brutalist-button flex items-center justify-center gap-2 text-[10px]"
            >
              <engine.icon size={12} />
              {engine.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

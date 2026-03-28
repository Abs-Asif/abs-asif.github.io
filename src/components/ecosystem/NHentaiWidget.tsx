import React, { useState } from 'react';
import { fetchNHentaiSearch, fetchNHentaiGallery, getNHentaiImageUrl } from '@/lib/api-utils';
import { Search, Loader2, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Gallery {
  id: string | number;
  media_id: string;
  title: {
    english: string;
    japanese: string;
    pretty: string;
  };
  images: {
    pages: { t: string; w: number; h: number }[];
  };
}

export const NHentaiWidget = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNHentaiSearch(query);
      if (data.result && Array.isArray(data.result)) {
        setGalleries(data.result);
      } else {
        setError('No results found.');
      }
    } catch (err) {
      setError('Failed to fetch galleries.');
    } finally {
      setLoading(false);
    }
  };

  const openGallery = async (id: string | number) => {
    setLoading(true);
    try {
      const data = await fetchNHentaiGallery(id.toString());
      setSelectedGallery(data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch gallery details.');
    } finally {
      setLoading(false);
    }
  };

  const getProxiedImgUrl = (url: string) => {
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  };

  if (selectedGallery) {
    return (
      <div className="brutalist-card relative">
        <button
          onClick={() => setSelectedGallery(null)}
          className="absolute top-2 right-2 p-1 border-2 border-black bg-white hover:bg-destructive hover:text-white"
        >
          <X size={16} />
        </button>
        <h2 className="text-lg font-bold mb-4 uppercase tracking-tighter pr-8 line-clamp-1">
          {selectedGallery.title.pretty || selectedGallery.title.english}
        </h2>

        <div className="aspect-[2/3] border-2 border-black mb-4 bg-secondary flex items-center justify-center overflow-hidden">
          <img
            src={getProxiedImgUrl(getNHentaiImageUrl(selectedGallery.media_id, currentPage, selectedGallery.images.pages[currentPage-1].t))}
            alt={`Page ${currentPage}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex justify-between items-center font-mono text-xs font-bold uppercase">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="brutalist-button px-2 py-1 disabled:opacity-50"
          >
            <ChevronLeft size={14} />
          </button>
          <span>Page {currentPage} / {selectedGallery.images.pages.length}</span>
          <button
            disabled={currentPage >= selectedGallery.images.pages.length}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="brutalist-button px-2 py-1 disabled:opacity-50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter flex items-center gap-2">
        H-Gallery <BookOpen size={18} className="text-primary" />
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ID or query..."
          className="brutalist-input font-mono text-xs"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="brutalist-button p-2" disabled={loading}>
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </button>
      </div>

      {error && (
        <div className="p-2 border-2 border-destructive bg-destructive/10 text-xs font-mono uppercase text-destructive font-bold mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {galleries.map((gallery) => (
          <button
            key={gallery.id}
            onClick={() => openGallery(gallery.id)}
            className="border-2 border-black p-1 hover:bg-secondary group"
          >
            <div className="aspect-[3/4] bg-muted mb-1 overflow-hidden relative border border-black/10">
              <img
                src={getProxiedImgUrl(`https://t.nhentai.net/galleries/${gallery.media_id}/thumb.jpg`)}
                alt={gallery.title.pretty}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <span className="text-[10px] font-bold uppercase font-mono line-clamp-1 text-left">
              #{gallery.id} {gallery.title.pretty || gallery.title.english}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

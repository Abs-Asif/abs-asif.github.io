import React, { useState } from 'react';
import { fetchWithProxy } from '@/lib/api-utils';
import { Search, Loader2, ExternalLink } from 'lucide-react';

interface PostData {
  title: string;
  image?: string;
}

const FEED_PATHS = ['/feed', '/atom', '/sitemap.xml', '/news-sitemap.xml', '/rss.xml'];

export const WebsiteChecker = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkWebsite = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setPosts([]);
    setError(null);

    const baseDomain = url.trim().replace(/\/$/, '');

    for (const path of FEED_PATHS) {
      try {
        const targetUrl = baseDomain + path;
        const response = await fetchWithProxy(targetUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Try Atom/RSS first
        let items = Array.from(xmlDoc.querySelectorAll('item, entry'));
        if (items.length > 0) {
          const extractedPosts: PostData[] = items.slice(0, 5).map(item => {
            const title = item.querySelector('title')?.textContent || 'Untitled';

            // Refined image extraction
            let image = item.querySelector('enclosure[type^="image/"]')?.getAttribute('url') ||
                        item.querySelector('media\\:content, content')?.getAttribute('url') ||
                        item.querySelector('thumbnail')?.getAttribute('url') ||
                        item.querySelector('media\\:thumbnail')?.getAttribute('url');

            // Try to find image in description if not found
            if (!image) {
              const description = item.querySelector('description, summary')?.textContent || '';
              const match = description.match(/<img[^>]+src="([^">]+)"/);
              if (match) image = match[1];
            }

            return { title, image: image || undefined };
          });
          setPosts(extractedPosts);
          setLoading(false);
          return;
        }

        // Try Sitemap
        let urls = Array.from(xmlDoc.querySelectorAll('url > loc'));
        if (urls.length > 0) {
          const extractedPosts: PostData[] = urls.slice(0, 5).map(loc => {
            const locText = loc.textContent || '';
            const title = locText.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || 'Page';
            return { title: title.charAt(0).toUpperCase() + title.slice(1) };
          });
          setPosts(extractedPosts);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`Failed to fetch ${path}`, err);
      }
    }

    setError('Could not find feed or sitemap data.');
    setLoading(false);
  };

  return (
    <div className="brutalist-card">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Site Checker</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="brutalist-input font-mono text-xs"
          onKeyDown={(e) => e.key === 'Enter' && checkWebsite()}
        />
        <button onClick={checkWebsite} className="brutalist-button p-2" disabled={loading}>
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
        </button>
      </div>

      {error && (
        <div className="p-2 border-2 border-destructive bg-destructive/10 text-xs font-mono uppercase text-destructive font-bold mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div key={idx} className="border-b-2 border-black pb-4 flex gap-3">
            {post.image && (
              <img
                src={post.image}
                alt=""
                className="w-16 h-16 object-cover border-2 border-black shrink-0"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div className="flex flex-col justify-between">
              <span className="font-bold text-sm leading-tight line-clamp-2">{post.title}</span>
              <button className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-primary mt-2">
                view_source <ExternalLink size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

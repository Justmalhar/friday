'use client';
import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getCache, setCache } from '@/app/utils/cache';
import { categories, type NewsCategory } from '@/app/config/newsCategories';

interface NewsItem {
  title: string;
  url: string;
  category: NewsCategory;
  publishedAt: string;
  source: string;
  description?: string;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsCategory>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      
      if (Array.isArray(data.articles)) {
        setNews(data.articles);
        setCache('news', data.articles);
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to fetch news');
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedNews = getCache<NewsItem[]>('news');
    if (Array.isArray(cachedNews) && cachedNews.length > 0) {
      setNews(cachedNews);
    } else {
      fetchNews();
    }
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date unavailable';
    }
  };

  const filteredNews = Array.isArray(news) 
    ? (selectedCategory === 'all'
        ? news
        : news.filter(item => item.category === selectedCategory))
      .filter(item => item.title && item.url && item.publishedAt)
    : [];

  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono text-blue-400">NEWS FEED</h2>
        <button
          onClick={fetchNews}
          disabled={isLoading}
          className={`p-1.5 rounded-full hover:bg-blue-500/20 text-blue-400/50 
                     hover:text-blue-400 transition-colors
                     ${isLoading ? 'animate-spin' : ''}`}
          title="Refresh News"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-mono whitespace-nowrap
                     border transition-colors ${
                       selectedCategory === 'all'
                         ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                         : 'border-blue-500/30 text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10'
                     }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-mono whitespace-nowrap
                       border transition-colors ${
                         selectedCategory === category
                           ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                           : 'border-blue-500/30 text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10'
                       }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="h-[400px] overflow-y-auto custom-scrollbar space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-400/50 font-mono text-sm">
              Fetching latest news...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 font-mono text-sm">
              {error}
            </div>
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 
                       border border-blue-500/30 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-blue-400/50 bg-blue-500/20 
                                 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-blue-400/30">
                    {formatDate(item.publishedAt)}
                  </span>
                  <span className="text-xs font-mono text-blue-400/50 whitespace-nowrap ml-auto">
                    {item.source}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-mono text-blue-400 leading-tight">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs font-mono text-blue-400/70 line-clamp-2">
                      {item.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-400/50 font-mono text-sm">
              No news available in this category
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
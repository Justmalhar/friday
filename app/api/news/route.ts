import { NextResponse } from 'next/server';
import { type NewsCategory } from '@/app/config/newsCategories';
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)',
  },
});

interface NewsItem {
  title: string;
  url: string;
  category: NewsCategory;
  publishedAt: string;
  source: string;
  description?: string;
}

const NEWS_SOURCES = {
  'World News': [
    {
      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
      source: 'BBC World'
    },
    {
      url: 'https://www.aljazeera.com/xml/rss/all.xml',
      source: 'Al Jazeera'
    }
  ],
  'US News': [
    {
      url: 'https://feeds.npr.org/1003/rss.xml',
      source: 'NPR'
    },
    {
      url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml',
      source: 'NY Times'
    }
  ],
  'India News': [
    {
      url: 'https://www.thehindu.com/news/national/feeder/default.rss',
      source: 'The Hindu'
    },
    {
      url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
      source: 'Times of India'
    }
  ],
  'Tech News': [
    {
      url: 'http://feeds.feedburner.com/TechCrunch/',
      source: 'TechCrunch'
    },
    {
      url: 'https://www.theverge.com/rss/index.xml',
      source: 'The Verge'
    }
  ],
  'Stock Market': [
    {
      url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
      source: 'CNBC Markets'
    }
  ],
  'HackerNews': [
    {
      url: 'https://hnrss.org/frontpage',
      source: 'Hacker News'
    }
  ]
};

async function fetchRSSFeed(url: string, category: NewsCategory, source: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 5).map(item => ({
      title: item.title?.replace(/&#8217;/g, "'")
                       .replace(/&#8216;/g, "'")
                       .replace(/&#8220;/g, '"')
                       .replace(/&#8221;/g, '"')
                       .replace(/&amp;/g, '&') || '',
      url: item.link || '',
      category,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      source,
      description: item.contentSnippet || item.content || ''
    }));
  } catch (error) {
    console.error(`Failed to fetch RSS feed from ${source}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Create promises for all RSS feeds
    const allPromises = Object.entries(NEWS_SOURCES).flatMap(([category, sources]) =>
      sources.map(({ url, source }) => 
        fetchRSSFeed(url, category as NewsCategory, source)
      )
    );

    // Fetch all feeds in parallel
    const results = await Promise.all(allPromises);

    // Combine, deduplicate by URL, and sort articles
    const articles = results
      .flat()
      .filter((item, index, self) => 
        index === self.findIndex((t) => t.url === item.url)
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({
      articles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RSS feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export const revalidate = 300; // 5 minutes
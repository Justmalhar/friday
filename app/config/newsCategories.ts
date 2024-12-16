export const categories = [
  'World News',
  'US News',
  'India News',
  'Tech News',
  'Stock Market',
  'HackerNews'
] as const;

export type NewsCategory = typeof categories[number];

// Mapping for API queries
export const categoryQueries: Record<NewsCategory, string> = {
  'World News': 'world news',
  'US News': 'US politics news',
  'India News': 'India news',
  'Tech News': 'technology news',
  'Stock Market': 'stock market financial news',
  'HackerNews': 'programming technology startup news'
}; 
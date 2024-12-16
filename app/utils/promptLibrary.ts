import fs from 'fs';
import path from 'path';

export interface Prompt {
  id: string;      // Original filename
  name: string;    // CamelCase name
  content: string; // Markdown content
}

export function toCamelCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

export async function loadPrompts(): Promise<Prompt[]> {
  const promptDir = path.join(process.cwd(), 'app', 'promptLibrary');
  
  try {
    if (!fs.existsSync(promptDir)) {
      console.error('Prompt directory not found:', promptDir);
      return [];
    }

    const files = fs.readdirSync(promptDir);
    
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(promptDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const id = file.replace('.md', '');
        const name = toCamelCase(id);
        
        return { id, name, content };
      });
  } catch (error) {
    console.error('Error loading prompts:', error);
    return [];
  }
} 
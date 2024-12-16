import { NextResponse } from 'next/server';
import { loadPrompts } from '@/app/utils/promptLibrary';

// Specify that this route requires Node.js runtime for fs operations
export const runtime = 'nodejs';

export async function GET() {
  try {
    const prompts = await loadPrompts();
    
    if (!prompts.length) {
      console.log('No prompts found in directory');
    }
    
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Failed to load prompts:', error);
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    );
  }
} 
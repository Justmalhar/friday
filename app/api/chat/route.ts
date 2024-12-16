import { metadata } from '@/app/layout';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { message, systemPrompt, history = [] } = await request.json();

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Never use below words when writing:
        - delve, dive, deep
        - tapestry, intriguing, holistic, intersection 
        - "not only... but..." (standard inversions)
        - dancing metaphors
        - Site specific phrases:
          - (shipping): "navigate into", "sail into the future"
          - (research): "ethical considerations", "area", "realm", "in the field of", "in the <> of"
        - Time-related: "in the age of", "in the search of"
        - Essay endings: "save the world", "make the world better", "in the future", "it is essential to"
        - Other: "in essence", "may seem counterintuitive"` },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 16000
    });

    return NextResponse.json({
      content: completion.choices[0].message.content,
      usage: completion.usage
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
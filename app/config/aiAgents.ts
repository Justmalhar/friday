export interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  systemPrompt: string;
}

export const aiAgents: AIAgent[] = [
  {
    id: 'assistant',
    name: 'Assistant',
    avatar: '🤖',
    systemPrompt: 'You are a helpful AI assistant.'
  },
  {
    id: 'coder',
    name: 'Code Expert',
    avatar: '👨‍💻',
    systemPrompt: 'You are an expert programmer who helps with coding tasks.'
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    avatar: '📊',
    systemPrompt: 'You are a data analyst who helps analyze and interpret data.'
  }
]; 
'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiAgents, AIAgent } from '@/app/config/aiAgents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId: string;
  timestamp: Date;
}

interface ChatHistory {
  [agentId: string]: Message[];
}

interface ParsedMessage extends Omit<Message, 'timestamp'> {
  timestamp: string;
}

const SLASH_COMMANDS = {
  clear: { command: '/clear', description: 'Clear chat history' },
  reset: { command: '/reset', description: 'Reset conversation' }
} as const;

export default function AgentsChat() {
  const [activeAgent, setActiveAgent] = useState<AIAgent>(aiAgents[0]);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Convert string dates back to Date objects
      Object.keys(parsed).forEach(agentId => {
        parsed[agentId] = parsed[agentId].map((msg: ParsedMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      });
      setChatHistory(parsed);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleSlashCommand = (command: string) => {
    switch (command) {
      case SLASH_COMMANDS.clear.command:
      case SLASH_COMMANDS.reset.command:
        setChatHistory(prev => ({
          ...prev,
          [activeAgent.id]: []
        }));
        setInput('');
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for slash commands
    if (value.startsWith('/')) {
      const command = Object.values(SLASH_COMMANDS).find(cmd => 
        cmd.command.startsWith(value.toLowerCase())
      );
      if (command && command.command === value.toLowerCase()) {
        handleSlashCommand(command.command);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check for slash commands before sending
    if (input.startsWith('/')) {
      const command = Object.values(SLASH_COMMANDS).find(cmd => 
        cmd.command === input.toLowerCase()
      );
      if (command) {
        handleSlashCommand(command.command);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      agentId: activeAgent.id,
      timestamp: new Date()
    };

    // Update chat history with user message
    const updatedHistory = {
      ...chatHistory,
      [activeAgent.id]: [...(chatHistory[activeAgent.id] || []), userMessage]
    };
    setChatHistory(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Get previous messages for this agent
      const previousMessages = chatHistory[activeAgent.id] || [];
      
      // Format history for API
      const messageHistory = previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          systemPrompt: activeAgent.systemPrompt,
          history: messageHistory
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        agentId: activeAgent.id,
        timestamp: new Date()
      };

      // Update chat history with assistant's response
      setChatHistory(prev => ({
        ...prev,
        [activeAgent.id]: [...(prev[activeAgent.id] || []), assistantMessage]
      }));
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = chatHistory[activeAgent.id] || [];

  return (
    <div className="bg-[#000B18] rounded-lg backdrop-blur-sm border border-blue-500/30 
                    shadow-lg shadow-blue-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-[#001529] border-b border-blue-500/30">
        {/* Title row */}
        <div className="px-4 py-2 border-b border-blue-500/30">
          <h2 className="text-lg font-mono text-blue-400">AI AGENTS</h2>
        </div>
        
        {/* Tabs row */}
        <div className="flex px-2 pt-2">
          {aiAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`
                relative px-4 py-2 text-sm font-mono transition-all rounded-t-lg
                flex items-center gap-2 min-w-[120px] justify-center
                ${activeAgent.id === agent.id
                  ? 'bg-[#000B18] text-blue-400 border-t border-l border-r border-blue-500/30'
                  : 'text-blue-400/50 hover:bg-[#000B18]/50 hover:text-blue-400'
                }
              `}
            >
              <span>{agent.avatar}</span>
              <span>{agent.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat container */}
      <div className="h-[400px] flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Show available commands when input starts with '/' */}
          {input.startsWith('/') && (
            <div className="fixed bottom-24 left-4 right-4 bg-[#001529] border border-blue-500/30 
                          rounded-lg p-2 shadow-lg z-10">
              <div className="text-xs font-mono text-blue-400/70 mb-2">Available commands:</div>
              {Object.values(SLASH_COMMANDS).map(cmd => (
                <div 
                  key={cmd.command}
                  className={`px-2 py-1 rounded font-mono text-sm ${
                    input === cmd.command 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-blue-400/50'
                  }`}
                >
                  <span className="text-blue-400">{cmd.command}</span>
                  <span className="ml-2 text-blue-400/50">- {cmd.description}</span>
                </div>
              ))}
            </div>
          )}

          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === 'assistant' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {message.role === 'assistant' ? activeAgent.avatar : '👤'}
              </div>
              
              <div className={`flex-1 p-3 rounded-lg ${
                message.role === 'assistant' 
                  ? 'bg-[#001529] border border-blue-500/30' 
                  : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-xs opacity-50 font-mono">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-[#001529] border-t border-blue-500/30">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${activeAgent.name} something... (Type / for commands)`}
              className="flex-1 bg-[#000B18] text-blue-100 font-mono text-sm p-2 rounded-md 
                       border border-blue-500/30 focus:border-blue-400 focus:outline-none
                       focus:ring-1 focus:ring-blue-400 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]
                       placeholder:text-blue-400/30"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500/20 text-blue-400 font-mono px-4 py-2 rounded-md
                       border border-blue-500/30 hover:bg-blue-500/30 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
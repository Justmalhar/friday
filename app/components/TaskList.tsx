'use client';
import { useState, useEffect, FormEvent } from 'react';
import { setCache, getCache } from '@/app/utils/cache';
import { Prompt } from '@/app/utils/promptLibrary';
import ReactMarkdown from 'react-markdown';
import { FiEye, FiDownload, FiTrash2 } from 'react-icons/fi';
import { useAIStats } from '../context/AIStatsContext';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  agentPrompt?: string;    // System prompt from markdown
  agentResponse?: string;  // AI response
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

function TaskResponseModal({ task, onClose }: TaskModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-[#000B18] rounded-lg border border-blue-500/30 w-full max-w-2xl m-4 shadow-lg">
        <div className="flex justify-between items-center p-4 border-b border-blue-500/30">
          <h3 className="text-lg font-mono text-blue-400">Task Response</h3>
          <button 
            onClick={onClose}
            className="text-blue-400/50 hover:text-blue-400"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>
              {task.agentResponse || 'No response available'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

const truncateText = (text: string, maxLength: number = 60) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const { updateStats } = useAIStats();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load tasks from cache
        const cachedTasks = getCache<Task[]>('tasks') || [];
        setTasks(cachedTasks);

        // Load prompts
        setIsLoadingPrompts(true);
        const response = await fetch('/api/prompts');
        const data = await response.json();
        if (data.prompts) {
          setPrompts(data.prompts);
        }
      } catch (error) {
        console.error('Failed to load prompts:', error);
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    setCache('tasks', tasks);
  }, [tasks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastAtIndex = newTask.lastIndexOf('@');
    const hasSelectedPrompt = selectedPrompt && newTask.includes(`[${selectedPrompt.name}]`);
    
    // If we have a selected prompt, insert text after it
    if (selectedPrompt && hasSelectedPrompt) {
      const [before, after] = newTask.split(`[${selectedPrompt.name}]`);
      setNewTask(`${before}[${selectedPrompt.name}]${value}`);
    } else {
      setNewTask(value);
    }

    // Show suggestions for new @mentions
    if (value.includes('@') && !hasSelectedPrompt) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Filter prompts based on input after @
  const getFilteredPrompts = () => {
    const match = newTask.match(/@(\w*)$/);
    if (!match) return prompts;
    
    const searchTerm = match[1].toLowerCase();
    return prompts.filter(prompt => 
      prompt.name.toLowerCase().includes(searchTerm)
    );
  };

  const handlePromptSelect = (prompt: Prompt) => {
    const beforeAt = newTask.slice(0, newTask.lastIndexOf('@'));
    setSelectedPrompt(prompt);
    setShowSuggestions(false);
    setNewTask(`${beforeAt}[${prompt.name}] `); // Add space after prompt
  };

  const getInputWithHighlight = () => {
    if (!selectedPrompt) return newTask;
    
    const parts = newTask.split(`[${selectedPrompt.name}]`);
    return (
      <>
        {parts[0]}
        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 rounded-full text-sm">
          @{selectedPrompt.name}
          <button
            onClick={() => {
              setSelectedPrompt(null);
              setNewTask(newTask.replace(`[${selectedPrompt.name}]`, ''));
            }}
            className="hover:text-blue-300"
          >
            ×
          </button>
        </span>
        {parts[1]}
      </>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task: Task = {
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      text: newTask.trim(),
      completed: false,
      status: selectedPrompt ? 'processing' : 'pending',
      agentPrompt: selectedPrompt?.content
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
    setSelectedPrompt(null);

    if (selectedPrompt) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: task.text,
            systemPrompt: selectedPrompt.content
          })
        });

        const data = await response.json();
        
        // Update AI Stats
        if (data.usage) {
          updateStats(data.usage);
        }
        
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, status: 'completed', completed: true, agentResponse: data.content }
            : t
        ));
      } catch (error) {
        setTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { ...t, status: 'error' }
            : t
        ));
      }
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const viewResponse = (task: Task) => {
    setSelectedTask(task);
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const downloadResponse = (task: Task) => {
    const blob = new Blob([task.agentResponse || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output-${task.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl bg-black/30 rounded-lg backdrop-blur-sm 
                    border border-blue-500/30 shadow-lg shadow-blue-500/20 relative">
      <div className="flex items-center justify-between p-4 border-b border-blue-500/30">
        <h2 className="text-2xl font-mono text-blue-400">
          SYSTEM TASKS
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-mono text-emerald-400">ONLINE</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-b border-blue-500/30">
        <div className="flex flex-col gap-2">
          <div className="flex-1 bg-black/20 text-blue-100 font-mono text-sm rounded-md 
                         border border-blue-500/30 focus-within:border-blue-400 focus-within:ring-1 
                         focus-within:ring-blue-400 group">
            {/* Selected Agent Tag - Show above input on mobile */}
            {selectedPrompt && (
              <div className="px-2 pt-2">
                <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 
                               px-2 py-1 rounded-full text-sm">
                  @{selectedPrompt.name}
                  <button
                    onClick={() => {
                      setSelectedPrompt(null);
                      setNewTask(newTask.replace(`[${selectedPrompt.name}]`, ''));
                    }}
                    className="hover:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
            
            {/* Input Field */}
            <input
              type="text"
              value={selectedPrompt ? newTask.split(`[${selectedPrompt.name}]`)[1] || '' : newTask}
              onChange={handleInputChange}
              placeholder={selectedPrompt ? "Enter task description..." : "Add new task... (Use @ to mention an agent)"}
              className="w-full bg-transparent border-none outline-none p-2
                       placeholder:text-blue-400/30 focus:ring-0"
            />
          </div>

          {/* Add Button - Full width on mobile */}
          <button
            type="submit"
            className="bg-blue-500/20 text-blue-400 font-mono px-4 py-2 rounded-md
                     border border-blue-500/30 hover:bg-blue-500/30 transition-all
                     md:w-auto w-full"
          >
            ADD
          </button>
        </div>

        {/* Prompt suggestions with scrollbar and filtering */}
        {showSuggestions && !selectedPrompt && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 bg-black/50 z-[60] md:hidden" 
              onClick={() => setShowSuggestions(false)}
            />
            
            {/* Suggestions dropdown */}
            <div className="fixed md:absolute inset-x-4 md:inset-x-auto md:left-4 md:right-16 
                          bottom-20 md:bottom-auto md:top-full mt-2 
                          bg-[#001529] border border-blue-500/30 rounded-lg 
                          shadow-lg z-[70]">
              <div className="max-h-[40vh] md:max-h-[300px] overflow-y-auto custom-scrollbar hover-scroll">
                {isLoadingPrompts ? (
                  <div className="px-4 py-2 text-sm font-mono text-blue-400/70">
                    Loading prompts...
                  </div>
                ) : getFilteredPrompts().length > 0 ? (
                  <>
                    <div className="sticky top-0 bg-[#001529] px-4 py-2 border-b border-blue-500/30">
                      <div className="text-xs font-mono text-blue-400/70">
                        {getFilteredPrompts().length} prompts available
                      </div>
                    </div>
                    {getFilteredPrompts().map(prompt => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptSelect(prompt)}
                        className="w-full px-4 py-2 text-left font-mono text-sm hover:bg-blue-500/20
                                 text-blue-400/70 hover:text-blue-400 transition-colors flex items-center gap-2"
                      >
                        <span className="flex-shrink-0">@{prompt.name}</span>
                        <span className="text-xs text-blue-400/30 truncate">
                          {prompt.id.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-2 text-sm font-mono text-blue-400/70">
                    No matching prompts found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </form>

      <div className="h-[400px] overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-4 border-b border-blue-500/10 hover:bg-blue-500/10 
                     transition-colors group w-full"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2 max-w-full">
              <div className="flex items-center gap-3 flex-1 min-w-0 max-w-full">
                <div
                  onClick={() => toggleTask(task.id)}
                  className="cursor-pointer flex items-center gap-3 flex-1 min-w-0 max-w-full"
                >
                  <div className={`relative flex-shrink-0 w-3 h-3 rounded-full transition-colors ${
                    task.completed 
                      ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                      : task.status === 'error'
                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : task.status === 'processing'
                          ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                          : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  }`} />
                  
                  <div className={`flex items-center gap-2 min-w-0 max-w-full
                    ${task.completed ? 'text-emerald-400 line-through' : 'text-blue-100'}`}
                  >
                    {/* Show agent name as a pill if present */}
                    {task.agentPrompt && (
                      <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 
                                     px-2 py-0.5 rounded-full text-sm flex-shrink-0">
                        @{task.text.match(/\[(.*?)\]/)?.[1]}
                      </span>
                    )}
                    {/* Show the truncated task text without the agent brackets */}
                    <span className="truncate block font-mono text-sm">
                      {truncateText(task.text.replace(/\[(.*?)\]\s*/, ''))}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity 
                           text-red-400/50 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10
                           flex-shrink-0"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {task.agentPrompt && (
                <div className="flex items-center gap-2 ml-6 md:ml-0 flex-shrink-0">
                  <span className={`relative text-xs font-mono px-2 py-1 rounded-full border ${
                    task.status === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : task.status === 'processing'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        : task.status === 'error'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {task.status}
                  </span>

                  {task.status === 'completed' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => viewResponse(task)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full
                                 bg-blue-500/10 text-blue-400 border border-blue-500/30
                                 hover:bg-blue-500/20 transition-colors"
                        title="View Response"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadResponse(task)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full
                                 bg-blue-500/10 text-blue-400 border border-blue-500/30
                                 hover:bg-blue-500/20 transition-colors"
                        title="Download Response"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskResponseModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
} 
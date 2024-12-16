'use client';
import { useState, useEffect } from 'react';

interface CommandLog {
  id: number;
  type: 'voice' | 'system' | 'user' | 'response';
  message: string;
  timestamp: Date;
}

export default function CommandCenter() {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'voice' | 'system'>('all');

  useEffect(() => {
    // Simulate incoming commands and responses
    const commandTemplates = [
      { type: 'voice', message: 'Voice command received: "Update security protocols"' },
      { type: 'system', message: 'Initiating system diagnostic sequence' },
      { type: 'user', message: 'Request: Analysis of current weather patterns' },
      { type: 'response', message: 'Weather analysis complete. Displaying results.' },
      { type: 'voice', message: 'Voice command received: "Monitor network traffic"' },
      { type: 'system', message: 'Deploying neural network update v2.4.1' },
      { type: 'response', message: 'Neural network optimization complete' },
      { type: 'user', message: 'Request: Scan for potential security breaches' },
      { type: 'system', message: 'Running quantum encryption protocols' },
      { type: 'voice', message: 'Voice command received: "Status report"' }
    ];

    const addNewLog = () => {
      const template = commandTemplates[Math.floor(Math.random() * commandTemplates.length)];
      const newLog: CommandLog = {
        id: Date.now(),
        type: template.type as CommandLog['type'],
        message: template.message,
        timestamp: new Date()
      };

      setLogs(prev => [newLog, ...prev].slice(0, 8));
    };

    // Add initial logs
    addNewLog();
    addNewLog();
    addNewLog();

    // Add new log every 3-7 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        addNewLog();
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    activeTab === 'all' || 
    (activeTab === 'voice' && log.type === 'voice') ||
    (activeTab === 'system' && ['system', 'response'].includes(log.type))
  );

  const getTypeStyles = (type: CommandLog['type']) => {
    switch (type) {
      case 'voice':
        return 'text-purple-400 border-purple-500/30';
      case 'system':
        return 'text-blue-400 border-blue-500/30';
      case 'user':
        return 'text-emerald-400 border-emerald-500/30';
      case 'response':
        return 'text-cyan-400 border-cyan-500/30';
    }
  };

  const getTypeIcon = (type: CommandLog['type']) => {
    switch (type) {
      case 'voice':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'response':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-mono text-blue-400">COMMAND CENTER</h2>
        <div className="flex gap-2">
          {(['all', 'voice', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-blue-400/50 hover:text-blue-400'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className={`p-2 border rounded bg-black/20 flex items-start gap-2 ${getTypeStyles(log.type)}`}
          >
            <div className="mt-1">{getTypeIcon(log.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm truncate">{log.message}</div>
              <div className="font-mono text-xs opacity-50">
                {log.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
        <span className="font-mono text-xs text-blue-400/50">
          Command Processing: Active
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-emerald-400">READY</span>
        </div>
      </div>
    </div>
  );
} 
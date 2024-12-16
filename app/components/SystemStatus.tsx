'use client';
import { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [cpuLoad, setCpuLoad] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  
  // Simulate fluctuating system metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 5)));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
      <h2 className="text-xl font-mono text-blue-400 mb-4">SYSTEM STATUS</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-sm text-blue-300">CPU Load</span>
            <span className="font-mono text-sm text-blue-400">{cpuLoad.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${cpuLoad}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-sm text-blue-300">Memory Usage</span>
            <span className="font-mono text-sm text-blue-400">{memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
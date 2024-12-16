'use client';
import { useState, useEffect } from 'react';
import { getSystemMetrics, SystemMetrics } from '@/app/utils/systemMetrics';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    cpuLoad: 0,
    networkLatency: 0,
    activeProcesses: 0,
    uptime: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getSystemMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value >= critical) return 'bg-red-500';
    if (value >= warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
      <h2 className="text-xl font-mono text-blue-400 mb-4">SYSTEM MONITOR</h2>
      
      <div className="space-y-4">
        {/* Memory Usage */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">Memory Usage</span>
            <span className="font-mono text-sm text-blue-400">
              {metrics.memoryUsage.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getStatusColor(metrics.memoryUsage, [60, 80])}`}
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>

        {/* CPU Load */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">CPU Load</span>
            <span className="font-mono text-sm text-blue-400">
              {metrics.cpuLoad.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getStatusColor(metrics.cpuLoad, [70, 90])}`}
              style={{ width: `${metrics.cpuLoad}%` }}
            />
          </div>
        </div>

        {/* Network Status */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-blue-300">Network Latency</span>
          <span className={`font-mono text-sm ${
            metrics.networkLatency > 150 ? 'text-red-400' :
            metrics.networkLatency > 100 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {metrics.networkLatency.toFixed(0)}ms
          </span>
        </div>

        {/* Active Processes */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-blue-300">Active Processes</span>
          <span className="font-mono text-sm text-blue-400">
            {metrics.activeProcesses}
          </span>
        </div>

        {/* System Uptime */}
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-blue-300">System Uptime</span>
          <span className="font-mono text-sm text-blue-400">
            {formatUptime(metrics.uptime)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
        <span className="font-mono text-xs text-blue-400/50">
          Status: OPERATIONAL
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs text-green-400">ONLINE</span>
        </div>
      </div>
    </div>
  );
} 
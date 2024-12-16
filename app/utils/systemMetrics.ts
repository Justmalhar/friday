export interface SystemMetrics {
  memoryUsage: number;     // Percentage
  cpuLoad: number;         // Percentage
  networkLatency: number;  // in ms
  activeProcesses: number;
  uptime: number;         // in seconds
}

let startTime = Date.now();

export function getSystemMetrics(): SystemMetrics {
  // Simulate memory usage between 30-80%
  const memoryUsage = 30 + Math.sin(Date.now() / 10000) * 25 + Math.random() * 25;
  
  // Simulate CPU load between 10-90%
  const cpuLoad = 10 + Math.sin(Date.now() / 5000) * 40 + Math.random() * 40;
  
  // Simulate network latency between 20-200ms
  const networkLatency = 20 + Math.sin(Date.now() / 3000) * 90 + Math.random() * 90;
  
  // Simulate active processes between 50-150
  const activeProcesses = Math.floor(50 + Math.sin(Date.now() / 20000) * 50 + Math.random() * 50);
  
  // Real uptime since page load
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  return {
    memoryUsage,
    cpuLoad,
    networkLatency,
    activeProcesses,
    uptime
  };
} 
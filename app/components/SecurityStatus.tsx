'use client';

export default function SecurityStatus() {
  return (
    <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
      <h2 className="text-xl font-mono text-blue-400 mb-4">SECURITY</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-mono text-sm text-blue-300">Firewall Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-mono text-sm text-blue-300">Encryption Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="font-mono text-sm text-blue-300">Last Scan: 2h ago</span>
        </div>
      </div>
    </div>
  );
} 
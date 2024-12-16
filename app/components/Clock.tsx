'use client';
import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    // Set initial time
    setTime(new Date().toLocaleTimeString());
    
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render anything until we're on the client
  if (!time) {
    return (
      <div className="font-mono text-4xl md:text-6xl text-blue-400 bg-black/30 p-4 rounded-lg 
                    backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20
                    hover:shadow-blue-500/40 transition-shadow">
        --:--:--
      </div>
    );
  }

  return (
    <div className="font-mono text-4xl md:text-6xl text-blue-400 bg-black/30 p-4 rounded-lg 
                    backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20
                    hover:shadow-blue-500/40 transition-shadow">
      {time}
    </div>
  );
} 
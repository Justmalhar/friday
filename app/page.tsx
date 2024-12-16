import Clock from './components/Clock';
import TaskList from './components/TaskList';
import AIStatusMonitor from './components/AIStatusMonitor';
import WeatherWidget from './components/WeatherWidget';
import AgentsChat from './components/AgentsChat';
import NewsWidget from './components/NewsWidget';

export default function Home() {
  return (
    <div className="min-h-screen cyberpunk-grid bg-black">
      <div className="container mx-auto px-4 py-8">
        <main className="flex flex-col items-center gap-8">
          <h1 className="text-3xl md:text-5xl font-mono text-blue-400 font-bold animate-pulse">
            F.R.I.D.A.Y
          </h1>
          
          <Clock />

          {/* Widgets Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Main task list spans full width on mobile, 2 columns on larger screens */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <TaskList />
            </div>
            
            {/* Side widgets stack on mobile, align vertically on larger screens */}
            <div className="col-span-1 space-y-4">
              <AIStatusMonitor />
              <WeatherWidget />
              <AgentsChat />
              <NewsWidget />
            </div>
          </div>

          <div className="fixed bottom-4 right-4 font-mono text-xs text-blue-400 bg-black/30 p-2 rounded-lg backdrop-blur-sm border border-blue-500/30">
            SYSTEM STATUS: ONLINE
          </div>
        </main>
      </div>
    </div>
  );
}

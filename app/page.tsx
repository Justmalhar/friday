import { ErrorBoundary } from './components/ErrorBoundary';
import NewsWidget from './components/NewsWidget';
import WeatherWidget from './components/WeatherWidget';
import TaskList from './components/TaskList';
import AgentsChat from './components/AgentsChat';
import AIStatusMonitor from './components/AIStatusMonitor';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 cyberpunk-grid">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <ErrorBoundary>
          <NewsWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <WeatherWidget />
        </ErrorBoundary>
        <ErrorBoundary>
          <AIStatusMonitor />
        </ErrorBoundary>
        <ErrorBoundary>
          <TaskList />
        </ErrorBoundary>
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <AgentsChat />
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
}

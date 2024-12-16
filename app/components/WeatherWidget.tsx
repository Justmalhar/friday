'use client';
import { useState, useEffect } from 'react';
import { locations } from '@/app/config/locations';
import { setCache, getCache, TTL } from '@/app/utils/cache';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const cached = getCache<WeatherData[]>('weather', TTL.weather);
        if (cached) {
          setWeatherData(cached);
          setLoading(false);
          return;
        }

        const promises = locations.map((_, index) =>
          fetch(`/api/weather?location=${index}`).then(res => res.json())
        );

        const results = await Promise.all(promises);
        setWeatherData(results);
        setCache('weather', results);
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    fetchAllLocations();
    const interval = setInterval(fetchAllLocations, TTL.weather);
    
    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeIndex < locations.length - 1) {
      setActiveIndex(current => current + 1);
    }
    if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(current => current - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handlePrevious = () => {
    setActiveIndex((current) => 
      current === 0 ? locations.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => 
      current === locations.length - 1 ? 0 : current + 1
    );
  };

  if (loading) {
    return (
      <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
        <h2 className="text-xl font-mono text-blue-400 mb-4">ENVIRONMENTAL</h2>
        <div className="animate-pulse text-blue-400">Initializing sensors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 shadow-lg shadow-blue-500/20 p-4">
        <h2 className="text-xl font-mono text-blue-400 mb-4">ENVIRONMENTAL</h2>
        <div className="text-red-400 font-mono text-sm">{error}</div>
      </div>
    );
  }

  const weather = weatherData[activeIndex];
  if (!weather) return null;

  return (
    <div className="relative">
      <button 
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 
                   bg-black/30 text-blue-400 hover:text-blue-300 backdrop-blur-sm
                   w-8 h-8 rounded-full border border-blue-500/30 
                   flex items-center justify-center transition-colors
                   shadow-lg shadow-blue-500/20 z-10"
        aria-label="Previous location"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-5 h-5"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>

      <div 
        className="bg-black/30 rounded-lg backdrop-blur-sm border border-blue-500/30 
                   shadow-lg shadow-blue-500/20 p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-mono text-blue-400">ENVIRONMENTAL</h2>
          <div className="flex gap-1">
            {locations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-blue-400' : 'bg-blue-400/30'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">Location</span>
            <span className="font-mono text-lg text-blue-400">{weather.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">Temperature</span>
            <span className="font-mono text-2xl text-blue-400">
              {weather.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">Humidity</span>
            <span className="font-mono text-2xl text-blue-400">{weather.humidity}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-blue-300">Conditions</span>
            <span className="font-mono text-lg text-blue-400">{weather.conditions}</span>
          </div>
          {weather.aqi !== undefined && (
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm text-blue-300">Air Quality</span>
              <div className="text-right">
                <div className="font-mono text-lg text-blue-400">{weather.aqi} AQI</div>
                <div className={`font-mono text-xs ${getAQIColor(weather.aqi)}`}>
                  {weather.aqiLevel}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 text-center text-blue-400/50 text-xs font-mono">
          Swipe to change location
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 
                   bg-black/30 text-blue-400 hover:text-blue-300 backdrop-blur-sm
                   w-8 h-8 rounded-full border border-blue-500/30 
                   flex items-center justify-center transition-colors
                   shadow-lg shadow-blue-500/20 z-10"
        aria-label="Next location"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="w-5 h-5"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>
    </div>
  );
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return 'text-green-400';
  if (aqi <= 100) return 'text-yellow-400';
  if (aqi <= 150) return 'text-orange-400';
  if (aqi <= 200) return 'text-red-400';
  if (aqi <= 300) return 'text-purple-400';
  return 'text-rose-400';
} 
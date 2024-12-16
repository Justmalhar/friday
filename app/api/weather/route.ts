import { NextResponse } from 'next/server';
import { locations } from '@/app/config/locations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationIndex = parseInt(searchParams.get('location') || '0');
    const location = locations[locationIndex];

    if (!location) {
      throw new Error('Invalid location index');
    }

    // Fetch both weather and air quality data
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&hourly=us_aqi&timezone=auto`)
    ]);

    if (!weatherRes.ok || !aqiRes.ok) {
      throw new Error(`API responded with status: ${!weatherRes.ok ? weatherRes.status : aqiRes.status}`);
    }

    const [weatherData, aqiData] = await Promise.all([
      weatherRes.json(),
      aqiRes.json()
    ]);

    // Debug logs
    console.log('Weather Data:', weatherData);
    console.log('AQI Data:', aqiData);

    const conditions = getWeatherCondition(weatherData.current.weather_code);
    
    // Get the latest AQI value from hourly data
    const latestAqi = aqiData.hourly.us_aqi[aqiData.hourly.us_aqi.length - 1];
    const aqiLevel = getAQILevel(latestAqi);

    const response = NextResponse.json({
      location: location.name,
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      conditions: conditions,
      aqi: latestAqi,
      aqiLevel: aqiLevel
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
    return response;
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}

function getWeatherCondition(code: number): string {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function getAQILevel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
} 
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  },
}

export default nextConfig; 
import './globals.css'
import { AIStatsProvider } from './context/AIStatsContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-blue-400">
        <AIStatsProvider>
          {children}
        </AIStatsProvider>
      </body>
    </html>
  )
}

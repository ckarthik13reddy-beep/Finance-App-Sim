import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Market Floor | Live Trading Room', description: 'A classroom portfolio simulation.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}

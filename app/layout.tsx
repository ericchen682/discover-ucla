import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: 'Discover UCLA - Events Calendar',
  description: 'Centralized hub to track events in and around UCLA',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}




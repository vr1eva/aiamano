import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import './globals.css'
import { cn } from "@/lib/utils"
import { ClerkProvider } from '@clerk/nextjs'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Voicechat with OpenAI GPT model',
  description: 'Made with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={cn(
          "h-full bg-background font-sans antialiased py-3 px-4",
          fontSans.variable
        )}>{children}</body>
      </ClerkProvider>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`font-sans ${plusJakarta.variable}`}>
      <body className={`font-mono ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

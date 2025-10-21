import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Londoolink AI - Your Intelligent Command Center",
  description: "AI-powered personal assistant that reduces information overload",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#1A202C",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Londoolink AI",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  )
}

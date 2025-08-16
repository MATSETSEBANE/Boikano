import type React from "react"
import type { Metadata } from "next"
import { Geist, Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/server"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Echo - Connect, Share, Chill",
  description: "The ultimate social platform for video calls, reels, chat, and virtual hangouts",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} antialiased`}>
      <body className="font-sans">
        {user && <Navigation />}
        <main className={user ? "pt-16 lg:pt-20" : ""}>{children}</main>
      </body>
    </html>
  )
}

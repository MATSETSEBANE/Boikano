import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />
      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Echo
            </h1>
            <p className="text-sm text-gray-500 mt-1">Connect, Share, Chill</p>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

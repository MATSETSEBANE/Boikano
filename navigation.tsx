"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Video, MessageCircle, Users, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/reels", label: "Reels", icon: Video },
  { href: "/video-chat", label: "Video Chat", icon: Video },
  { href: "/chat", label: "Messages", icon: MessageCircle },
  { href: "/rooms", label: "Rooms", icon: Users },
  { href: "/profile/me", label: "Profile", icon: User },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const NavContent = () => (
    <nav className="flex lg:space-x-8 space-y-2 lg:space-y-0 flex-col lg:flex-row">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 lg:space-x-1 px-4 py-2 lg:px-3 lg:py-2 rounded-lg transition-colors ${
              isActive ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="h-5 w-5 lg:h-4 lg:w-4" />
            <span className="font-medium lg:text-sm">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Echo
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavContent />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="py-4">
                    <NavContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                  isActive ? "text-purple-600" : "text-gray-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoomCard } from "./room-card"
import { CreateRoomDialog } from "./create-room-dialog"
import { getRooms, joinRoom } from "@/lib/actions"

interface Room {
  id: string
  name: string
  description: string
  theme: string
  max_participants: number
  is_private: boolean
  participant_count: number
  participants: Array<{
    id: string
    username: string
    avatar_url: string
  }>
  created_by: {
    username: string
    full_name: string
  }
}

interface RoomBrowserProps {
  onRoomJoin?: (roomId: string) => void
}

export function RoomBrowser({ onRoomJoin }: RoomBrowserProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [themeFilter, setThemeFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const result = await getRooms()
      if (result.success) {
        setRooms(result.rooms || [])
      }
    } catch (error) {
      console.error("[v0] Error loading rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    try {
      const result = await joinRoom(roomId)
      if (result.success) {
        onRoomJoin?.(roomId)
        loadRooms() // Refresh room list
      } else {
        alert(result.error || "Failed to join room")
      }
    } catch (error) {
      console.error("[v0] Error joining room:", error)
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTheme = themeFilter === "all" || room.theme === themeFilter
    return matchesSearch && matchesTheme
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chilling Rooms</h1>
          <p className="text-gray-600">Join virtual hangout spaces and meet new people</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={themeFilter} onValueChange={setThemeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Themes</SelectItem>
            <SelectItem value="music">Music</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="study">Study</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="party">Party</SelectItem>
            <SelectItem value="workout">Workout</SelectItem>
            <SelectItem value="meditation">Meditation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-500 mb-4">Be the first to create a chilling room!</p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Create Room
          </Button>
        </div>
      )}

      <CreateRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onRoomCreated={loadRooms} />
    </div>
  )
}

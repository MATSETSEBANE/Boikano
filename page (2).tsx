"use client"
import { RoomBrowser } from "@/components/room-browser"

export default function RoomsPage() {
  const handleRoomJoin = (roomId: string) => {
    // Navigate to room or show room interface
    console.log("[v0] Joining room:", roomId)
    // In a real app, you'd navigate to /rooms/[roomId] or show room modal
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <RoomBrowser onRoomJoin={handleRoomJoin} />
      </div>
    </div>
  )
}

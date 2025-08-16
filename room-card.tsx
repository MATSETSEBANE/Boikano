"use client"

import { Users, Lock, Music, Gamepad2, BookOpen, Coffee, PartyPopper, Dumbbell, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"

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

interface RoomCardProps {
  room: Room
  onJoin: (roomId: string) => void
}

const themeIcons = {
  music: Music,
  gaming: Gamepad2,
  study: BookOpen,
  casual: Coffee,
  party: PartyPopper,
  workout: Dumbbell,
  meditation: Brain,
}

const themeColors = {
  music: "bg-purple-100 text-purple-700",
  gaming: "bg-blue-100 text-blue-700",
  study: "bg-green-100 text-green-700",
  casual: "bg-orange-100 text-orange-700",
  party: "bg-pink-100 text-pink-700",
  workout: "bg-red-100 text-red-700",
  meditation: "bg-indigo-100 text-indigo-700",
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const ThemeIcon = themeIcons[room.theme as keyof typeof themeIcons] || Coffee
  const themeColor = themeColors[room.theme as keyof typeof themeColors] || "bg-gray-100 text-gray-700"

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${themeColor}`}>
              <ThemeIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {room.name}
                {room.is_private && <Lock className="h-4 w-4 text-gray-500" />}
              </CardTitle>
              <p className="text-sm text-gray-600">by {room.created_by.full_name}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {room.participant_count}/{room.max_participants}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>

        {/* Participants Preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex -space-x-2">
              {room.participants.slice(0, 4).map((participant) => (
                <UserAvatar
                  key={participant.id}
                  src={participant.avatar_url}
                  alt={participant.username}
                  size="xs"
                  className="border-2 border-white"
                />
              ))}
              {room.participant_count > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">+{room.participant_count - 4}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => onJoin(room.id)}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group-hover:scale-105 transition-transform"
            disabled={room.participant_count >= room.max_participants}
          >
            {room.participant_count >= room.max_participants ? "Full" : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

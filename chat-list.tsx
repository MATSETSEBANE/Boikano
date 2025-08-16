"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "./user-avatar"
import { getConversations } from "@/lib/actions"

interface Conversation {
  id: string
  name: string
  avatar_url: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_online: boolean
  other_user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_online: boolean
  }
}

interface ChatListProps {
  onConversationSelect: (conversationId: string, otherUser: any) => void
}

export function ChatList({ onConversationSelect }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const result = await getConversations()
      if (result.success) {
        setConversations(result.conversations || [])
      }
    } catch (error) {
      console.error("[v0] Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </h2>
        <Button size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations */}
      <div className="space-y-2">
        {filteredConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onConversationSelect(conversation.id, conversation.other_user)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <UserAvatar src={conversation.other_user.avatar_url} alt={conversation.other_user.username} size="md" />
                {conversation.other_user.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{conversation.other_user.full_name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{formatTime(conversation.last_message_time)}</span>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="bg-purple-600 text-white text-xs px-2 py-1">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
              </div>
            </div>
          </Card>
        ))}

        {filteredConversations.length === 0 && !loading && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400">Start chatting with someone!</p>
          </div>
        )}
      </div>
    </div>
  )
}

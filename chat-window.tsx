"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "./user-avatar"
import { Badge } from "@/components/ui/badge"
import { sendMessage, getMessages, markAsRead } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

interface ChatWindowProps {
  conversationId: string
  otherUser: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_online: boolean
  }
}

export function ChatWindow({ conversationId, otherUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    markAsRead(conversationId)

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("[v0] New message received:", payload)
          loadMessages() // Reload messages to get sender info
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const result = await getMessages(conversationId)
      if (result.success) {
        setMessages(result.messages || [])
      }
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const result = await sendMessage(conversationId, newMessage.trim())
      if (result.success) {
        setNewMessage("")
        // Message will be added via real-time subscription
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isMyMessage = (senderId: string) => {
    // In a real app, you'd get the current user ID from auth context
    return false // Placeholder - replace with actual user ID check
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-card">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <UserAvatar src={otherUser.avatar_url} alt={otherUser.username} size="md" />
            {otherUser.is_online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
            )}
          </div>
          <div>
            <p className="font-semibold text-card-foreground text-sm">{otherUser.full_name}</p>
            <Badge variant={otherUser.is_online ? "default" : "secondary"} className="text-xs mt-1">
              {otherUser.is_online ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${isMyMessage(message.sender_id) ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md`}>
              {!isMyMessage(message.sender_id) && (
                <UserAvatar src={message.sender.avatar_url} alt={message.sender.username} size="sm" />
              )}
              <div className="flex flex-col">
                {!isMyMessage(message.sender_id) && (
                  <p className="text-xs font-semibold text-muted-foreground mb-1 px-4">{message.sender.full_name}</p>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isMyMessage(message.sender_id)
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground border border-border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p
                  className={`text-xs text-muted-foreground mt-1 ${
                    isMyMessage(message.sender_id) ? "text-right pr-2" : "text-left pl-2"
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
              {isMyMessage(message.sender_id) && (
                <UserAvatar src={message.sender.avatar_url} alt={message.sender.username} size="sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-base">No messages yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4 bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border-border focus:ring-primary/20"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

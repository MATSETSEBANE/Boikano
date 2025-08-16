"use client"

import { useState } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatWindow } from "@/components/chat-window"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string
    otherUser: any
  } | null>(null)

  const handleConversationSelect = (conversationId: string, otherUser: any) => {
    setSelectedConversation({ id: conversationId, otherUser })
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  return (
    <div className="h-screen flex bg-background">
      {!selectedConversation && (
        <div className="w-full bg-card border-r overflow-y-auto">
          <div className="p-4">
            <ChatList onConversationSelect={handleConversationSelect} />
          </div>
        </div>
      )}

      {selectedConversation && (
        <div className="w-full flex flex-col">
          {/* Back button header */}
          <div className="flex items-center gap-3 p-4 border-b bg-card">
            <Button variant="ghost" size="icon" onClick={handleBackToList} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                {selectedConversation.otherUser.full_name?.charAt(0) ||
                  selectedConversation.otherUser.username?.charAt(0) ||
                  "?"}
              </div>
              <div>
                <h3 className="font-medium text-sm">{selectedConversation.otherUser.full_name}</h3>
                <p className="text-xs text-muted-foreground">@{selectedConversation.otherUser.username}</p>
              </div>
            </div>
          </div>

          <ChatWindow conversationId={selectedConversation.id} otherUser={selectedConversation.otherUser} />
        </div>
      )}
    </div>
  )
}

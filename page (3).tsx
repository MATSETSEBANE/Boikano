"use client"

import { useState } from "react"
import { CallMatching } from "@/components/call-matching"
import { VideoCallInterface } from "@/components/video-call-interface"

export default function VideoChatPage() {
  const [currentCall, setCurrentCall] = useState<{
    callId: string
    partnerId: string
    partnerName: string
    partnerAvatar?: string
  } | null>(null)

  const handleMatchFound = (callId: string, partnerId: string, partnerName: string) => {
    setCurrentCall({
      callId,
      partnerId,
      partnerName,
      partnerAvatar: `/placeholder.svg?height=40&width=40&query=${partnerName}`,
    })
  }

  const handleCallEnd = () => {
    setCurrentCall(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {currentCall ? (
        <VideoCallInterface
          callId={currentCall.callId}
          partnerId={currentCall.partnerId}
          partnerName={currentCall.partnerName}
          partnerAvatar={currentCall.partnerAvatar}
          onCallEnd={handleCallEnd}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Video Chat
            </h1>
            <p className="text-gray-600 mt-2">Meet new people through random video calls</p>
          </div>

          <CallMatching onMatchFound={handleMatchFound} />
        </div>
      )}
    </div>
  )
}

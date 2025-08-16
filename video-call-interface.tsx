"use client"

import { useState, useRef, useEffect } from "react"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Flag, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { endCall, reportUser, findNextMatch } from "@/lib/actions"

interface VideoCallInterfaceProps {
  callId: string
  partnerId: string
  partnerName: string
  partnerAvatar?: string
  onCallEnd?: () => void
}

export function VideoCallInterface({
  callId,
  partnerId,
  partnerName,
  partnerAvatar,
  onCallEnd,
}: VideoCallInterfaceProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initializeCall()
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      cleanup()
    }
  }, [])

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      })

      peerConnectionRef.current = peerConnection

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
        setIsConnected(true)
      }

      // Handle ICE candidates (in real app, you'd send these via signaling server)
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[v0] ICE candidate:", event.candidate)
          // Send candidate to remote peer via signaling server
        }
      }
    } catch (error) {
      console.error("[v0] Error initializing call:", error)
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const handleEndCall = async () => {
    try {
      await endCall(callId)
      cleanup()
      onCallEnd?.()
    } catch (error) {
      console.error("[v0] Error ending call:", error)
    }
  }

  const handleReport = async () => {
    try {
      const reason = prompt("Please describe the issue:")
      if (reason) {
        await reportUser(partnerId, callId, reason)
        alert("Report submitted. Thank you for keeping our community safe.")
      }
    } catch (error) {
      console.error("[v0] Error reporting user:", error)
    }
  }

  const handleSkip = async () => {
    try {
      await endCall(callId)
      const result = await findNextMatch()
      if (result.success) {
        // Handle new match
        window.location.reload() // Simple approach - in real app, update state
      }
    } catch (error) {
      console.error("[v0] Error skipping:", error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            {partnerAvatar ? (
              <img
                src={partnerAvatar || "/placeholder.svg"}
                alt={partnerName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">{partnerName[0]}</span>
            )}
          </div>
          <div>
            <p className="font-semibold">{partnerName}</p>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
        </div>
        <div className="text-sm font-mono">{formatDuration(callDuration)}</div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Card className="p-6 text-center">
              <CardContent>
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-gray-600">Connecting to {partnerName}...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button variant="destructive" size="icon" className="rounded-full w-14 h-14" onClick={handleEndCall}>
            <PhoneOff className="h-6 w-6" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-transparent" onClick={handleSkip}>
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 bg-transparent"
            onClick={handleReport}
          >
            <Flag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  likes?: number
  comments?: number
  isLiked?: boolean
}

export function VideoPlayer({
  src,
  poster,
  className = "",
  onLike,
  onComment,
  onShare,
  likes = 0,
  comments = 0,
  isLiked = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate)
      return () => video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover rounded-lg"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </Button>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={onLike}>
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <span className="text-white text-sm">{likes}</span>

          <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={onComment}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm">{comments}</span>

          <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70" onClick={onShare}>
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

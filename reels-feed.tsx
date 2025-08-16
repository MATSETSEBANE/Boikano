"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "./video-player"
import { UserAvatar } from "./user-avatar"
import { FollowButton } from "./follow-button"
import { Card } from "@/components/ui/card"
import { getReels, likePost, unlikePost } from "@/lib/actions"

interface Reel {
  id: string
  content: string
  media_url: string
  created_at: string
  user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

export function ReelsFeed() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    try {
      const result = await getReels()
      if (result.success) {
        setReels(result.reels || [])
      }
    } catch (error) {
      console.error("Error loading reels:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (reelId: string, isLiked: boolean) => {
    try {
      const result = isLiked ? await unlikePost(reelId) : await likePost(reelId)
      if (result.success) {
        setReels(
          reels.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  is_liked: !isLiked,
                  likes_count: isLiked ? reel.likes_count - 1 : reel.likes_count + 1,
                }
              : reel,
          ),
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full max-w-sm mx-auto h-96 animate-pulse bg-gray-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {reels.map((reel) => (
        <Card key={reel.id} className="overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar src={reel.user.avatar_url} alt={reel.user.username} size="sm" />
              <div>
                <p className="font-semibold text-sm">{reel.user.username}</p>
                <p className="text-xs text-gray-500">{reel.user.full_name}</p>
              </div>
            </div>
            <FollowButton userId={reel.user.id} />
          </div>

          <VideoPlayer
            src={reel.media_url}
            className="aspect-[9/16] max-h-[600px]"
            onLike={() => handleLike(reel.id, reel.is_liked)}
            likes={reel.likes_count}
            comments={reel.comments_count}
            isLiked={reel.is_liked}
          />

          {reel.content && (
            <div className="p-4">
              <p className="text-sm">{reel.content}</p>
            </div>
          )}
        </Card>
      ))}

      {reels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No reels yet. Be the first to share!</p>
        </div>
      )}
    </div>
  )
}

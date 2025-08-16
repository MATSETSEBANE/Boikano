"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { followUser, unfollowUser } from "@/lib/actions"

interface FollowButtonProps {
  userId: string
  isFollowing?: boolean
  className?: string
}

export function FollowButton({ userId, isFollowing = false, className = "" }: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isPending, startTransition] = useTransition()

  const handleFollow = () => {
    startTransition(async () => {
      try {
        if (following) {
          const result = await unfollowUser(userId)
          if (result.success) {
            setFollowing(false)
          }
        } else {
          const result = await followUser(userId)
          if (result.success) {
            setFollowing(true)
          }
        }
      } catch (error) {
        console.error("Follow/unfollow error:", error)
      }
    })
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isPending}
      variant={following ? "outline" : "default"}
      size="sm"
      className={`${
        following
          ? "border-pink-200 hover:bg-pink-50 text-pink-600"
          : "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}

export default FollowButton

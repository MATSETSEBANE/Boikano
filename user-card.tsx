import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import UserAvatar from "./user-avatar"
import FollowButton from "./follow-button"
import Link from "next/link"
import { MapPin, Calendar } from "lucide-react"

interface UserCardProps {
  user: {
    id: string
    username: string
    full_name?: string
    bio?: string
    avatar_url?: string
    location?: string
    gender?: string
    created_at: string
    is_online?: boolean
  }
  currentUserId: string
  isFollowing: boolean
  showFollowButton?: boolean
}

export default function UserCard({ user, currentUserId, isFollowing, showFollowButton = true }: UserCardProps) {
  const isOwnProfile = user.id === currentUserId

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Link href={`/profile/${user.username}`}>
              <UserAvatar
                src={user.avatar_url}
                alt={user.username}
                fallback={user.username?.charAt(0).toUpperCase()}
                size="lg"
                className="cursor-pointer hover:ring-2 hover:ring-pink-300 transition-all"
              />
            </Link>
            {user.is_online && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Link href={`/profile/${user.username}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-pink-600 transition-colors cursor-pointer">
                    {user.full_name || user.username}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              {showFollowButton && !isOwnProfile && <FollowButton userId={user.id} isFollowing={isFollowing} />}
            </div>

            {user.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>}

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.gender && (
                <Badge variant="secondary" className="text-xs">
                  {user.gender}
                </Badge>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

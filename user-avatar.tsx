import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl" | "xs"
  className?: string
}

export function UserAvatar({ src, alt, fallback, size = "md", className = "" }: UserAvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback className="bg-gradient-to-br from-pink-100 to-violet-100 text-gray-700">
        {fallback ? <span className="font-semibold">{fallback}</span> : <User className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar

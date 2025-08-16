"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { updateProfile } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import UserAvatar from "./user-avatar"

interface ProfileEditFormProps {
  user: {
    id: string
    username: string
    full_name?: string
    bio?: string
    avatar_url?: string
    location?: string
    gender?: string
  }
  onSuccess?: () => void
}

export default function ProfileEditForm({ user, onSuccess }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    location: user.location || "",
    gender: user.gender || "other",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const result = await updateProfile(user.id, formData)
        if (result.success) {
          toast({ description: "Profile updated successfully" })
          onSuccess?.()
        } else {
          toast({ description: result.error, variant: "destructive" })
        }
      } catch (error) {
        toast({ description: "Something went wrong", variant: "destructive" })
      }
    })
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <UserAvatar
              src={user.avatar_url}
              alt={user.username}
              fallback={user.username?.charAt(0).toUpperCase()}
              size="xl"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <Input id="username" value={user.username} disabled className="bg-gray-50 border-gray-200" />
              <p className="text-xs text-gray-500">Username cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
                className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Your location"
                className="border-gray-200 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="border-gray-200 focus:border-pink-400 focus:ring-pink-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

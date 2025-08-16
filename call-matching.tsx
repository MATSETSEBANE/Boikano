"use client"

import { useState, useEffect } from "react"
import { Video, Users, Heart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { joinCallQueue, leaveCallQueue, checkQueueStatus } from "@/lib/actions"

interface CallMatchingProps {
  onMatchFound?: (callId: string, partnerId: string, partnerName: string) => void
}

export function CallMatching({ onMatchFound }: CallMatchingProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [genderPreference, setGenderPreference] = useState<string>("any")
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [onlineUsers, setOnlineUsers] = useState(0)

  useEffect(() => {
    // Simulate online users count
    setOnlineUsers(Math.floor(Math.random() * 500) + 100)

    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(checkQueue, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSearching])

  const checkQueue = async () => {
    try {
      const result = await checkQueueStatus()
      if (result.success) {
        if (result.matched) {
          setIsSearching(false)
          onMatchFound?.(result.callId, result.partnerId, result.partnerName)
        } else if (result.position) {
          setQueuePosition(result.position)
        }
      }
    } catch (error) {
      console.error("[v0] Error checking queue:", error)
    }
  }

  const startSearching = async () => {
    try {
      setIsSearching(true)
      const result = await joinCallQueue(genderPreference)
      if (result.success) {
        setQueuePosition(result.position || 1)
      } else {
        setIsSearching(false)
      }
    } catch (error) {
      console.error("[v0] Error joining queue:", error)
      setIsSearching(false)
    }
  }

  const stopSearching = async () => {
    try {
      await leaveCallQueue()
      setIsSearching(false)
      setQueuePosition(null)
    } catch (error) {
      console.error("[v0] Error leaving queue:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Online Now</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {onlineUsers.toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Matching Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Video className="h-6 w-6 text-purple-600" />
            <span>Random Video Chat</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Connect with someone new from around the world</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSearching ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender Preference</label>
                <Select value={genderPreference} onValueChange={setGenderPreference}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Anyone</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startSearching}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Video Chat
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto" />
                <Heart className="absolute inset-0 m-auto h-6 w-6 text-purple-600" />
              </div>

              <div>
                <p className="font-medium">Finding your match...</p>
                {queuePosition && <p className="text-sm text-gray-600">Position in queue: {queuePosition}</p>}
              </div>

              <Button onClick={stopSearching} variant="outline" className="w-full bg-transparent">
                Cancel Search
              </Button>
            </div>
          )}

          {/* Safety Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Stay Safe:</strong> Never share personal information. Report inappropriate behavior immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

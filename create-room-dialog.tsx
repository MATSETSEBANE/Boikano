"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createRoom } from "@/lib/actions"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated: () => void
}

export function CreateRoomDialog({ open, onOpenChange, onRoomCreated }: CreateRoomDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    theme: "casual",
    maxParticipants: 20,
    isPrivate: false,
    password: "",
  })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setCreating(true)
    try {
      const result = await createRoom(formData)
      if (result.success) {
        onRoomCreated()
        onOpenChange(false)
        setFormData({
          name: "",
          description: "",
          theme: "casual",
          maxParticipants: 20,
          isPrivate: false,
          password: "",
        })
      } else {
        alert(result.error || "Failed to create room")
      }
    } catch (error) {
      console.error("[v0] Error creating room:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Chilling Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter room name..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this room about?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Chat</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Select
              value={formData.maxParticipants.toString()}
              onValueChange={(value) => setFormData({ ...formData, maxParticipants: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 people</SelectItem>
                <SelectItem value="10">10 people</SelectItem>
                <SelectItem value="20">20 people</SelectItem>
                <SelectItem value="50">50 people</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
            />
            <Label htmlFor="private">Private Room</Label>
          </div>

          {formData.isPrivate && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter room password..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {creating ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadReel } from "@/lib/actions"

export function ReelUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("video", file)
      formData.append("caption", caption)

      const result = await uploadReel(formData)
      if (result.success) {
        setFile(null)
        setCaption("")
        setPreview(null)
        // Show success message or redirect
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (preview) {
      URL.revokeObjectURL(preview)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload Reel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Select a video to upload</p>
            <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" id="video-upload" />
            <Button asChild>
              <label htmlFor="video-upload" className="cursor-pointer">
                Choose Video
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video src={preview || ""} className="w-full h-64 object-cover rounded-lg" controls />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px]"
            />

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUploading ? "Uploading..." : "Share Reel"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

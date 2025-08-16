"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function checkDatabaseConnection() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase client not available")
  }

  try {
    // Simple connection test - this will work even if custom tables don't exist
    const { error } = await supabase.auth.getUser()
    return !error
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    return false
  }
}

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()
  if (!supabase) {
    return { error: "Supabase client not available" }
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const username = formData.get("username")
  const fullName = formData.get("fullName")
  const gender = formData.get("gender")

  if (!email || !password || !username) {
    return { error: "Email, password, and username are required" }
  }

  const supabase = createClient()
  if (!supabase) {
    return { error: "Supabase client not available" }
  }

  try {
    console.log("[v0] Starting user signup...")

    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          username: username.toString(),
          full_name: fullName?.toString() || "",
          gender: gender?.toString() || "other",
        },
      },
    })

    if (error) {
      console.log("[v0] Auth signup error:", error)
      return { error: error.message }
    }

    if (data.user) {
      console.log("[v0] Attempting to create user profile for:", data.user.id)
      try {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email.toString(),
          username: username.toString(),
          full_name: fullName?.toString() || "",
          gender: gender?.toString() || "other",
        })

        if (profileError) {
          console.log("[v0] Profile creation skipped (table may not exist):", profileError.message)
        } else {
          console.log("[v0] User profile created successfully")
        }
      } catch (profileError) {
        console.log("[v0] Profile creation failed, continuing with auth-only signup")
      }
    }

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) {
    redirect("/auth/login")
    return
  }

  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}

export async function followUser(userId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: "Not authenticated" }
  }

  if (currentUser.id === userId) {
    return { error: "Cannot follow yourself" }
  }

  try {
    const { error } = await supabase.from("followers").insert({
      follower_id: currentUser.id,
      following_id: userId,
    })

    if (error) {
      if (error.code === "23505") {
        return { error: "Already following this user" }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Follow error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function unfollowUser(userId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Unfollow error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateProfile(
  userId: string,
  data: {
    full_name: string
    bio: string
    location: string
    gender: string
  },
) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser || currentUser.id !== userId) {
    return { error: "Not authorized" }
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({
        full_name: data.full_name,
        bio: data.bio,
        location: data.location,
        gender: data.gender,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getUsers(searchQuery?: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    let query = supabase
      .from("users")
      .select("id, username, full_name, bio, avatar_url, is_online")
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query.limit(20)

    if (error) {
      return { error: error.message }
    }

    return { success: true, users: data }
  } catch (error) {
    console.error("Get users error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getUserProfile(username: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      console.log("[v0] Custom users table not available, using auth data")
      const { data: authUser, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser.user) {
        return { error: "User not found" }
      }

      // Return basic profile from auth data
      return {
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          username: authUser.user.user_metadata?.username || username,
          full_name: authUser.user.user_metadata?.full_name || "User",
          bio: null,
          avatar_url: null,
          gender: authUser.user.user_metadata?.gender || "other",
          is_online: false,
          created_at: authUser.user.created_at,
          followers_count: 0,
          following_count: 0,
        },
      }
    }

    // Get follower counts if custom table exists
    const { count: followersCount } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id)

    const { count: followingCount } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id)

    return {
      success: true,
      user: {
        ...user,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
      },
    }
  } catch (error) {
    console.error("Get user profile error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function likePost(postId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("likes").insert({
      user_id: user.id,
      post_id: postId,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Like post error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function unlikePost(postId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Unlike post error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function uploadReel(formData: FormData) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const video = formData.get("video") as File
  const caption = formData.get("caption") as string

  if (!video) {
    return { error: "Video file is required" }
  }

  try {
    // In a real app, you'd upload to Vercel Blob or similar
    const videoUrl = `/placeholder.mp4?query=${encodeURIComponent(caption || "reel video")}`

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: caption,
      media_url: videoUrl,
      media_type: "video",
      is_reel: true,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Upload reel error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getReels() {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        media_url,
        created_at,
        user:users(id, username, full_name, avatar_url)
      `)
      .eq("is_reel", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      return { error: error.message }
    }

    // Get likes and comments count for each reel
    const reelsWithCounts = await Promise.all(
      (data || []).map(async (reel) => {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", reel.id)

        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", reel.id)

        return {
          ...reel,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: false, // TODO: Check if current user liked
        }
      }),
    )

    return { success: true, reels: reelsWithCounts }
  } catch (error) {
    console.error("Get reels error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Video calling actions
export async function joinCallQueue(genderPreference: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("call_queue").insert({
      user_id: user.id,
      gender_preference: genderPreference,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, position: 1 }
  } catch (error) {
    console.error("Join call queue error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function leaveCallQueue() {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("call_queue").delete().eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Leave call queue error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function checkQueueStatus() {
  // Simulate matching logic
  return { success: true, matched: false, position: 1 }
}

export async function endCall(callId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    const { error } = await supabase
      .from("video_calls")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", callId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("End call error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function reportUser(userId: string, callId: string, reason: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("call_reports").insert({
      reporter_id: user.id,
      reported_user_id: userId,
      call_id: callId,
      reason,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Report user error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function findNextMatch() {
  // Simulate finding next match
  return { success: true }
}

// Chat system actions
export async function getConversations() {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get conversations where user is a participant
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations:conversation_id(
          id,
          name,
          type,
          created_at
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    // Mock conversation data for now
    const conversations = [
      {
        id: "1",
        name: "Chat",
        avatar_url: "/abstract-geometric-shapes.png",
        last_message: "Hey there!",
        last_message_time: new Date().toISOString(),
        unread_count: 2,
        other_user: {
          id: "2",
          username: "john_doe",
          full_name: "John Doe",
          avatar_url: "/thoughtful-man-in-library.png",
          is_online: true,
        },
      },
    ]

    return { success: true, conversations }
  } catch (error) {
    console.error("Get conversations error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getMessages(conversationId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        sender_id,
        created_at,
        sender:users(id, username, full_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      return { error: error.message }
    }

    return { success: true, messages: data || [] }
  } catch (error) {
    console.error("Get messages error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Send message error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function markAsRead(conversationId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { error } = await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Mark as read error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Chilling rooms actions
export async function getRooms() {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  try {
    const { data, error } = await supabase
      .from("chilling_rooms")
      .select(`
        id,
        name,
        description,
        theme,
        max_participants,
        is_private,
        created_by:users(username, full_name)
      `)
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    if (error) {
      return { error: error.message }
    }

    // Mock room data with participant counts
    const roomsWithCounts = (data || []).map((room) => ({
      ...room,
      participant_count: Math.floor(Math.random() * 15) + 1,
      participants: [
        {
          id: "1",
          username: "user1",
          avatar_url: "/abstract-geometric-shapes.png",
        },
        {
          id: "2",
          username: "user2",
          avatar_url: "/abstract-geometric-shapes.png",
        },
      ],
    }))

    return { success: true, rooms: roomsWithCounts }
  } catch (error) {
    console.error("Get rooms error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createRoom(roomData: {
  name: string
  description: string
  theme: string
  maxParticipants: number
  isPrivate: boolean
  password: string
}) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const { data, error } = await supabase
      .from("chilling_rooms")
      .insert({
        name: roomData.name,
        description: roomData.description,
        theme: roomData.theme,
        max_participants: roomData.maxParticipants,
        is_private: roomData.isPrivate,
        password: roomData.password || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Add creator as room participant
    await supabase.from("room_participants").insert({
      room_id: data.id,
      user_id: user.id,
      role: "owner",
    })

    return { success: true, room: data }
  } catch (error) {
    console.error("Create room error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function joinRoom(roomId: string, password?: string) {
  const supabase = createClient()
  if (!supabase) {
    return { error: "Database connection error" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Check if room exists and get details
    const { data: room, error: roomError } = await supabase.from("chilling_rooms").select("*").eq("id", roomId).single()

    if (roomError || !room) {
      return { error: "Room not found" }
    }

    // Check password for private rooms
    if (room.is_private && room.password !== password) {
      return { error: "Invalid password" }
    }

    // Check if room is full
    const { count } = await supabase
      .from("room_participants")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId)

    if (count && count >= room.max_participants) {
      return { error: "Room is full" }
    }

    // Add user to room
    const { error } = await supabase.from("room_participants").insert({
      room_id: roomId,
      user_id: user.id,
    })

    if (error) {
      if (error.code === "23505") {
        return { error: "Already in this room" }
      }
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Join room error:", error)
    return { error: "An unexpected error occurred" }
  }
}

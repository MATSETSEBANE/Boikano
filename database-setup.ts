import { createClient } from "@supabase/supabase-js"

export async function initializeDatabase() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    console.log("[v0] Checking database connection...")

    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error && error.code === "42P01") {
      console.log("[v0] Database tables not found. Please run the setup script in your Supabase dashboard.")
      return { error: "Database not initialized. Please run the setup script." }
    }

    console.log("[v0] Database connection verified")
    return { success: true }
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    return { error: "Failed to connect to database" }
  }
}

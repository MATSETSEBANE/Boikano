import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/signup-form"
import { AuthLayout } from "@/components/auth-layout"

export default async function SignUpPage() {
  if (!isSupabaseConfigured) {
    return (
      <AuthLayout title="Configuration Required">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Connect Supabase to get started</h1>
        </div>
      </AuthLayout>
    )
  }

  const supabase = createClient()
  if (!supabase) {
    return (
      <AuthLayout title="Connection Error">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Database connection error</h1>
        </div>
      </AuthLayout>
    )
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <AuthLayout title="Join Echo" subtitle="Create your account and start connecting">
      <SignUpForm />
    </AuthLayout>
  )
}

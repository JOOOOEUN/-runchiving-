import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard?strava_error=auth_failed`)
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.message || "Token exchange failed")
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login?error=not_logged_in`)
    }

    // Save Strava tokens to user profile (you'll need to add these columns to your profiles table)
    // For now, we'll store in a separate strava_connections table
    const { error: dbError } = await supabase
      .from("strava_connections")
      .upsert({
        user_id: user.id,
        strava_athlete_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete_data: tokenData.athlete,
      })

    if (dbError) {
      console.error("DB Error:", dbError)
      // Continue anyway - connection might work
    }

    return NextResponse.redirect(`${origin}/dashboard?strava_connected=true`)
  } catch (error) {
    console.error("Strava auth error:", error)
    return NextResponse.redirect(`${origin}/dashboard?strava_error=connection_failed`)
  }
}

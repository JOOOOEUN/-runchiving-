"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

interface RegisterButtonProps {
  raceId: string
}

export function RegisterButton({ raceId }: RegisterButtonProps) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase.from("registrations").insert({
        user_id: user.id,
        race_id: raceId,
        status: "registered",
      })

      if (error) {
        if (error.code === "23505") {
          alert("이미 신청한 대회입니다.")
        } else {
          throw error
        }
      } else {
        setIsRegistered(true)
        router.push("/dashboard/registrations")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("신청 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <Button disabled className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        신청 완료
      </Button>
    )
  }

  return (
    <Button onClick={handleRegister} disabled={isLoading} size="lg">
      {isLoading ? "신청 중..." : "대회 신청하기"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddToMyRacesButtonProps {
  raceId: string
  size?: "sm" | "default" | "lg"
  className?: string
}

export function AddToMyRacesButton({ raceId, size = "sm", className = "" }: AddToMyRacesButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()

  const handleAddToMyRaces = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // 로그인 체크
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // 이미 등록했는지 체크
      const { data: existing } = await supabase
        .from("registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("race_id", raceId)
        .single()

      if (existing) {
        setIsAdded(true)
        return
      }

      // 등록 추가
      const { error } = await supabase.from("registrations").insert({
        user_id: user.id,
        race_id: raceId,
        status: "registered",
      })

      if (error) throw error

      setIsAdded(true)
      router.refresh()
    } catch (error) {
      console.error("Error adding to my races:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAdded) {
    return (
      <Button
        size={size}
        variant="outline"
        className={`gap-1 text-xs bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20 hover:text-green-500 ${className}`}
        disabled
      >
        <Check className="h-3 w-3" />
        추가됨
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant="secondary"
      className={`gap-1 text-xs ${className}`}
      onClick={handleAddToMyRaces}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CalendarPlus className="h-3 w-3" />
      )}
      내 대회 추가
    </Button>
  )
}

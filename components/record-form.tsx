"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Activity } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { parseDistances } from "@/lib/distance-utils"

interface RecordFormProps {
  registrations: any[]
  preselectedRegistrationId?: string
}

// 페이스 계산 함수
const calculatePace = (hours: string, minutes: string, seconds: string, distance: string) => {
  const totalSeconds = Number.parseInt(hours || "0") * 3600 + Number.parseInt(minutes || "0") * 60 + Number.parseInt(seconds || "0")

  let distanceKm = 0
  if (distance === "풀코스" || distance === "Full") distanceKm = 42.195
  else if (distance === "하프" || distance === "Half") distanceKm = 21.0975
  else if (distance === "10K") distanceKm = 10
  else if (distance === "5K") distanceKm = 5
  else if (distance === "울트라") distanceKm = 50

  if (distanceKm === 0 || totalSeconds === 0) return null

  const paceSeconds = totalSeconds / distanceKm
  const paceMin = Math.floor(paceSeconds / 60)
  const paceSec = Math.floor(paceSeconds % 60)
  return `00:${paceMin.toString().padStart(2, "0")}:${paceSec.toString().padStart(2, "0")}`
}

export function RecordForm({ registrations, preselectedRegistrationId }: RecordFormProps) {
  const [mode, setMode] = useState<"registration" | "manual">(preselectedRegistrationId ? "registration" : "manual")
  const [registrationId, setRegistrationId] = useState(preselectedRegistrationId || "")
  const [selectedDistance, setSelectedDistance] = useState("")

  // Manual entry fields
  const [raceName, setRaceName] = useState("")
  const [raceDate, setRaceDate] = useState("")
  const [raceLocation, setRaceLocation] = useState("")
  const [distance, setDistance] = useState("")

  // Common fields
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [seconds, setSeconds] = useState("")
  const [position, setPosition] = useState("")
  const [notes, setNotes] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [medalPhotoUrl, setMedalPhotoUrl] = useState("")
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Convert time to PostgreSQL interval format
      const finishTime = `${(hours || "0").padStart(2, "0")}:${(minutes || "0").padStart(2, "0")}:${(seconds || "0").padStart(2, "0")}`

      if (mode === "registration") {
        // Using existing registration
        const selectedReg = registrations.find((r) => r.id === registrationId)
        if (!selectedReg) {
          alert("대회를 선택해주세요")
          setIsLoading(false)
          return
        }

        // 중복 체크: 같은 대회에 이미 기록이 있는지 확인
        const { data: existingRecord } = await supabase
          .from("records")
          .select("id")
          .eq("user_id", user.id)
          .eq("race_id", selectedReg.race_id)
          .single()

        if (existingRecord) {
          alert("이미 이 대회에 기록이 등록되어 있습니다.")
          setIsLoading(false)
          return
        }

        // 여러 거리가 있는 대회인 경우 선택된 거리 사용
        const distances = parseDistances(selectedReg.race.distance)
        const finalDistance = distances.length > 1 ? selectedDistance : distances[0] || selectedReg.race.distance

        if (distances.length > 1 && !selectedDistance) {
          alert("참가 코스를 선택해주세요")
          setIsLoading(false)
          return
        }

        const pace = calculatePace(hours, minutes, seconds, finalDistance)

        const { error } = await supabase.from("records").insert({
          user_id: user.id,
          registration_id: registrationId,
          race_id: selectedReg.race_id,
          distance: finalDistance,
          finish_time: finishTime,
          pace: pace,
          position: position ? Number.parseInt(position) : null,
          photo_url: photoUrl || null,
          medal_photo_url: medalPhotoUrl || null,
          certificate_photo_url: certificatePhotoUrl || null,
          notes: notes || null,
          completed_at: selectedReg.race.date,
          is_public: isPublic,
        })

        if (error) throw error

        // Update registration status to completed
        await supabase.from("registrations").update({ status: "completed" }).eq("id", registrationId)
      } else {
        // Manual entry - create race first, then record
        if (!raceName || !raceDate || !distance) {
          alert("대회명, 날짜, 거리는 필수 항목입니다")
          setIsLoading(false)
          return
        }

        // Create new race entry
        const { data: newRace, error: raceError } = await supabase.from("races").insert({
          name: raceName,
          date: raceDate,
          location: raceLocation || null,
          distance: distance,
        }).select().single()

        if (raceError) throw raceError

        const pace = calculatePace(hours, minutes, seconds, distance)

        // Create record linked to the new race
        const { error: recordError } = await supabase.from("records").insert({
          user_id: user.id,
          race_id: newRace.id,
          distance: distance,
          finish_time: finishTime,
          pace: pace,
          position: position ? Number.parseInt(position) : null,
          photo_url: photoUrl || null,
          medal_photo_url: medalPhotoUrl || null,
          certificate_photo_url: certificatePhotoUrl || null,
          notes: notes || null,
          completed_at: raceDate,
          is_public: isPublic,
        })

        if (recordError) throw recordError
      }

      // 성공 시 페이지 이동
      window.location.href = "/dashboard/records"
    } catch (error) {
      console.error("Submit error:", error)
      alert("기록 추가 중 오류가 발생했습니다.")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">Strava에서 기록을 가져올 수 있습니다</span>
              <Button type="button" variant="outline" size="sm" className="ml-4 bg-transparent" asChild>
                <a href="/dashboard">연동 확인</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "registration" | "manual")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">직접 입력</TabsTrigger>
              <TabsTrigger value="registration" disabled={registrations.length === 0}>
                신청한 대회에서 ({registrations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registration" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration">대회 선택</Label>
                <Select value={registrationId} onValueChange={(value) => {
                  setRegistrationId(value)
                  // 대회 선택 시 거리 옵션 초기화
                  const selectedReg = registrations.find((r) => r.id === value)
                  if (selectedReg) {
                    const distances = parseDistances(selectedReg.race.distance)
                    if (distances.length === 1) {
                      setSelectedDistance(distances[0])
                    } else {
                      setSelectedDistance("")
                    }
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="대회를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {registrations.map((reg) => (
                      <SelectItem key={reg.id} value={reg.id}>
                        {reg.race.name} ({reg.race.distance}) - {new Date(reg.race.date).toLocaleDateString("ko-KR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 코스 선택 (거리가 여러 개인 경우) */}
              {registrationId && (() => {
                const selectedReg = registrations.find((r) => r.id === registrationId)
                if (!selectedReg) return null
                const distances = parseDistances(selectedReg.race.distance)
                if (distances.length <= 1) return null
                return (
                  <div className="space-y-2">
                    <Label htmlFor="selectedDistance">참가 코스 선택 *</Label>
                    <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                      <SelectTrigger>
                        <SelectValue placeholder="참가한 코스를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {distances.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })()}
            </TabsContent>

            <TabsContent value="manual" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raceName">대회명 *</Label>
                <Input
                  id="raceName"
                  placeholder="예: 2025 서울마라톤"
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="raceDate">대회 날짜 *</Label>
                  <Input
                    id="raceDate"
                    type="date"
                    value={raceDate}
                    onChange={(e) => setRaceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">거리 *</Label>
                  <Select value={distance} onValueChange={setDistance}>
                    <SelectTrigger>
                      <SelectValue placeholder="거리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5K">5K</SelectItem>
                      <SelectItem value="10K">10K</SelectItem>
                      <SelectItem value="하프">하프 (21.0975K)</SelectItem>
                      <SelectItem value="풀코스">풀코스 (42.195K)</SelectItem>
                      <SelectItem value="울트라">울트라 (50K+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raceLocation">장소</Label>
                <Input
                  id="raceLocation"
                  placeholder="예: 서울 광화문"
                  value={raceLocation}
                  onChange={(e) => setRaceLocation(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>완주 시간</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  placeholder="시간"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">시간</p>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="분"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">분</p>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="초"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">초</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">순위 (선택사항)</Label>
            <Input
              id="position"
              type="number"
              min="1"
              placeholder="예: 123"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="space-y-4">
            <Label>사진 업로드 (선택사항)</Label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ImageUpload
                value={medalPhotoUrl}
                onChange={setMedalPhotoUrl}
                folder="medals"
                label="메달 사진"
              />
              <ImageUpload
                value={certificatePhotoUrl}
                onChange={setCertificatePhotoUrl}
                folder="certificates"
                label="기록증 사진"
              />
              <ImageUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                folder="photos"
                label="대회 사진"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택사항)</Label>
            <Textarea
              id="notes"
              placeholder="대회 후기, 느낀 점 등을 기록하세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* 공개 설정 */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_public" className="text-base">기록 공개하기</Label>
              <p className="text-sm text-muted-foreground">
                다른 러너들이 내 기록과 메달을 볼 수 있습니다
              </p>
            </div>
            <Switch
              id="is_public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "저장 중..." : "기록 저장"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

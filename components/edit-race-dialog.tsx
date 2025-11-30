"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Loader2, Upload, X, ImageIcon, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import type { Race } from "@/lib/types"

interface EditRaceDialogProps {
  race: Race
}

export function EditRaceDialog({ race }: EditRaceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(race.poster_url)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: race.name,
    date: race.date,
    location: race.location,
    distance: race.distance,
    registration_url: race.registration_url || "",
    registration_deadline: race.registration_deadline || "",
    course_description: race.course_description || "",
    elevation_gain: race.elevation_gain?.toString() || "",
    difficulty: race.difficulty || "",
    max_participants: race.max_participants?.toString() || "",
    weather_notes: race.weather_notes || "",
    poster_url: race.poster_url || "",
  })

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다")
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `race-posters/${race.id}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("public")
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      setFormData({ ...formData, poster_url: publicUrl })
      setPosterPreview(publicUrl)
    } catch (error) {
      console.error("Upload error:", error)
      alert("이미지 업로드 중 오류가 발생했습니다")
    } finally {
      setIsUploading(false)
    }
  }

  const removePoster = () => {
    setFormData({ ...formData, poster_url: "" })
    setPosterPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.date || !formData.location || !formData.distance) {
      alert("필수 항목을 모두 입력해주세요")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const updateData = {
        name: formData.name,
        date: formData.date,
        location: formData.location,
        distance: formData.distance,
        registration_url: formData.registration_url || null,
        registration_deadline: formData.registration_deadline || null,
        course_description: formData.course_description || null,
        elevation_gain: formData.elevation_gain ? parseInt(formData.elevation_gain) : null,
        difficulty: formData.difficulty || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        weather_notes: formData.weather_notes || null,
        poster_url: formData.poster_url || null,
      }

      console.log("Updating race with data:", updateData)
      console.log("Race ID:", race.id)

      const { data, error } = await supabase
        .from("races")
        .update(updateData)
        .eq("id", race.id)
        .select()

      console.log("Update result - data:", data, "error:", error)

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("업데이트가 적용되지 않았습니다. RLS 정책을 확인해주세요.")
      }

      alert("대회 정보가 수정되었습니다!")
      setIsOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error:", error)
      alert(`수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Pencil className="h-4 w-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>대회 정보 수정</DialogTitle>
          <DialogDescription>
            대회 정보를 수정합니다. * 표시는 필수 항목입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">대회명 *</Label>
            <Input
              id="name"
              placeholder="예: 2025 서울마라톤"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">대회 날짜 *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>거리 * (복수 선택 가능)</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "5K", label: "5K" },
                { value: "10K", label: "10K" },
                { value: "Half", label: "하프" },
                { value: "Full", label: "풀코스" },
                { value: "Ultra", label: "울트라" },
              ].map((option) => {
                const distances = formData.distance.split(", ").filter(Boolean)
                const isChecked = distances.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      let newDistances: string[]
                      if (isChecked) {
                        newDistances = distances.filter((d) => d !== option.value)
                      } else {
                        newDistances = [...distances, option.value]
                      }
                      // 정렬: 5K, 10K, Half, Full, Ultra 순서로
                      const order = ["5K", "10K", "Half", "Full", "Ultra"]
                      newDistances.sort((a, b) => order.indexOf(a) - order.indexOf(b))
                      setFormData({ ...formData, distance: newDistances.join(", ") })
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      isChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary hover:bg-muted"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                    {option.label}
                  </button>
                )
              })}
            </div>
            {formData.distance && (
              <p className="text-xs text-muted-foreground">
                선택됨: {formData.distance}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">장소 *</Label>
            <Input
              id="location"
              placeholder="예: 서울특별시 광화문"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="registration_deadline">신청 마감일</Label>
              <Input
                id="registration_deadline"
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max_participants">최대 참가인원</Label>
              <Input
                id="max_participants"
                type="number"
                placeholder="예: 10000"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="difficulty">난이도</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="난이도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초급">초급</SelectItem>
                  <SelectItem value="중급">중급</SelectItem>
                  <SelectItem value="상급">상급</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="elevation_gain">총 상승고도 (m)</Label>
              <Input
                id="elevation_gain"
                type="number"
                placeholder="예: 150"
                value={formData.elevation_gain}
                onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="registration_url">신청 링크</Label>
            <Input
              id="registration_url"
              placeholder="https://..."
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>포스터 이미지</Label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {posterPreview ? (
                  <>
                    <img
                      src={posterPreview}
                      alt="포스터 미리보기"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePoster}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="hidden"
                  id="poster-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      이미지 업로드
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  또는 URL 직접 입력
                </p>
                <Input
                  id="poster_url"
                  placeholder="https://..."
                  value={formData.poster_url}
                  onChange={(e) => {
                    setFormData({ ...formData, poster_url: e.target.value })
                    setPosterPreview(e.target.value || null)
                  }}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course_description">코스 설명</Label>
            <Textarea
              id="course_description"
              placeholder="코스에 대한 간단한 설명..."
              value={formData.course_description}
              onChange={(e) => setFormData({ ...formData, course_description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="weather_notes">날씨 정보</Label>
            <Textarea
              id="weather_notes"
              placeholder="예년 날씨, 주의사항 등..."
              value={formData.weather_notes}
              onChange={(e) => setFormData({ ...formData, weather_notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

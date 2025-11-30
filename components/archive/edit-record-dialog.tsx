"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Upload, X, Loader2, Medal, FileText, ImageIcon, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EditRecordDialogProps {
  record: {
    id: string
    raceName: string
    date: string
    distance: string
    raceDistances: string
    finishTime: string
    pace: string
    position: number
    medalImage: string
    certificateImage: string | null
    photos: string[]
  }
}

// 거리 문자열 파싱 유틸
const parseDistances = (distanceStr: string): string[] => {
  if (!distanceStr) return []
  return distanceStr.split(",").map(d => d.trim()).filter(Boolean)
}

export function EditRecordDialog({ record }: EditRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // 코스 선택 상태
  const availableDistances = parseDistances(record.raceDistances)
  const [selectedDistance, setSelectedDistance] = useState(record.distance || availableDistances[0] || "")

  // 기록 정보 상태
  const timeParts = record.finishTime.split(":")
  const [hours, setHours] = useState(timeParts[0] || "0")
  const [minutes, setMinutes] = useState(timeParts[1] || "0")
  const [seconds, setSeconds] = useState(timeParts[2] || "0")
  const [position, setPosition] = useState(record.position > 0 ? record.position.toString() : "")

  // 이미지 상태
  const [medalImage, setMedalImage] = useState(record.medalImage || "")
  const [certificateImage, setCertificateImage] = useState(record.certificateImage || "")
  const [photos, setPhotos] = useState<string[]>(record.photos || [])

  // 업로드 상태
  const [uploadingMedal, setUploadingMedal] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // 파일 입력 refs
  const medalInputRef = useRef<HTMLInputElement>(null)
  const certificateInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // 페이스 계산 함수
  const calculatePace = (h: string, m: string, s: string, distance: string) => {
    const totalSeconds = Number.parseInt(h || "0") * 3600 + Number.parseInt(m || "0") * 60 + Number.parseInt(s || "0")

    let distanceKm = 0
    const d = distance.toLowerCase()
    if (d === "풀코스" || d === "full" || d.includes("42")) distanceKm = 42.195
    else if (d === "하프" || d === "half" || d.includes("21")) distanceKm = 21.0975
    else if (d === "10k" || d.includes("10")) distanceKm = 10
    else if (d === "5k" || d.includes("5")) distanceKm = 5
    else if (d === "울트라") distanceKm = 50

    if (distanceKm === 0 || totalSeconds === 0) return null

    const paceSeconds = totalSeconds / distanceKm
    const paceMin = Math.floor(paceSeconds / 60)
    const paceSec = Math.floor(paceSeconds % 60)
    return `00:${paceMin.toString().padStart(2, "0")}:${paceSec.toString().padStart(2, "0")}`
  }

  // 이미지 업로드 함수
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다")
      return null
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다")
      return null
    }

    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${record.id}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("public")
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    const { data: urlData } = supabase.storage
      .from("public")
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  // 메달 이미지 업로드
  const handleMedalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMedal(true)
    try {
      const url = await uploadImage(file, "medals")
      if (url) setMedalImage(url)
    } catch {
      alert("메달 이미지 업로드 중 오류가 발생했습니다")
    } finally {
      setUploadingMedal(false)
    }
  }

  // 기록증 이미지 업로드
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCertificate(true)
    try {
      const url = await uploadImage(file, "certificates")
      if (url) setCertificateImage(url)
    } catch {
      alert("기록증 이미지 업로드 중 오류가 발생했습니다")
    } finally {
      setUploadingCertificate(false)
    }
  }

  // 사진 업로드 (여러 장)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhoto(true)
    try {
      const newPhotos: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "race-photos")
        if (url) newPhotos.push(url)
      }
      setPhotos([...photos, ...newPhotos])
    } catch {
      alert("사진 업로드 중 오류가 발생했습니다")
    } finally {
      setUploadingPhoto(false)
    }
  }

  // 사진 삭제
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const finishTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
      const pace = calculatePace(hours, minutes, seconds, selectedDistance)

      // 기본 업데이트 데이터
      const updateData: Record<string, unknown> = {
        distance: selectedDistance,
        finish_time: finishTime,
        pace: pace,
        position: position ? Number.parseInt(position) : null,
        medal_photo_url: medalImage || null,
        certificate_photo_url: certificateImage || null,
        photo_url: photos[0] || null,
      }

      const { error } = await supabase
        .from("records")
        .update(updateData)
        .eq("id", record.id)

      if (error) throw error

      setOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Update error:", error)
      alert("수정 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start hover:bg-muted"
        >
          <Pencil className="mr-2 h-4 w-4" />
          기록 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>기록 수정</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-3 mb-4">
          <p className="font-medium">{record.raceName}</p>
          <p className="text-sm text-muted-foreground">{record.date} · {record.distance}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="text-xs">기록</TabsTrigger>
            <TabsTrigger value="medal" className="text-xs">메달</TabsTrigger>
            <TabsTrigger value="certificate" className="text-xs">기록증</TabsTrigger>
            <TabsTrigger value="photos" className="text-xs">사진</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* 기록 정보 탭 */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* 코스 선택 (여러 코스가 있는 경우에만 표시) */}
              {availableDistances.length > 1 && (
                <div className="space-y-2">
                  <Label>참가 코스</Label>
                  <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                    <SelectTrigger>
                      <SelectValue placeholder="코스를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDistances.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    대회 가능 코스: {record.raceDistances}
                  </p>
                </div>
              )}

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
                    />
                    <p className="mt-1 text-xs text-muted-foreground text-center">시간</p>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="분"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground text-center">분</p>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="초"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground text-center">초</p>
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
            </TabsContent>

            {/* 메달 탭 */}
            <TabsContent value="medal" className="mt-4">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  메달 이미지
                </Label>

                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-muted">
                    {medalImage ? (
                      <>
                        <img
                          src={medalImage}
                          alt="메달"
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setMedalImage("")}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <Medal className="h-12 w-12 mb-2" />
                        <span className="text-sm">메달 사진 없음</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={medalInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMedalUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => medalInputRef.current?.click()}
                    disabled={uploadingMedal}
                  >
                    {uploadingMedal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {medalImage ? "메달 변경" : "메달 추가"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 기록증 탭 */}
            <TabsContent value="certificate" className="mt-4">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  기록증 이미지
                </Label>

                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-64 w-48 overflow-hidden rounded-lg border bg-muted">
                    {certificateImage ? (
                      <>
                        <img
                          src={certificateImage}
                          alt="기록증"
                          className="h-full w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setCertificateImage("")}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-2" />
                        <span className="text-sm">기록증 사진 없음</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={certificateInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCertificateUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => certificateInputRef.current?.click()}
                    disabled={uploadingCertificate}
                  >
                    {uploadingCertificate ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {certificateImage ? "기록증 변경" : "기록증 추가"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 사진 탭 */}
            <TabsContent value="photos" className="mt-4">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  대회 사진 ({photos.length}장)
                </Label>

                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={photo}
                        alt={`사진 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground">
                          대표
                        </span>
                      )}
                    </div>
                  ))}

                  {/* 사진 추가 버튼 */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 transition-colors"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground text-center">
                  첫 번째 사진이 대표 사진으로 표시됩니다
                </p>
              </div>
            </TabsContent>

            <div className="flex gap-3 pt-4 mt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

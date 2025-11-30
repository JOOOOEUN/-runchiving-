"use client"

import { useState } from "react"
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
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SubmitRaceDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    distance: "",
    registration_url: "",
    registration_deadline: "",
    course_description: "",
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.date || !formData.location || !formData.distance) {
      alert("필수 항목을 모두 입력해주세요")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("races").insert({
        name: formData.name,
        date: formData.date,
        location: formData.location,
        distance: formData.distance,
        registration_url: formData.registration_url || null,
        registration_deadline: formData.registration_deadline || null,
        course_description: formData.course_description || null,
      })

      if (error) throw error

      alert("대회가 등록되었습니다!")
      setIsOpen(false)
      setFormData({
        name: "",
        date: "",
        location: "",
        distance: "",
        registration_url: "",
        registration_deadline: "",
        course_description: "",
      })

      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error("Error:", error)
      alert("등록 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          대회 등록하기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 대회 등록</DialogTitle>
          <DialogDescription>
            마라톤 대회 정보를 입력해주세요. * 표시는 필수 항목입니다.
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="distance">거리 *</Label>
              <Select
                value={formData.distance}
                onValueChange={(value) => setFormData({ ...formData, distance: value })}
              >
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

          <div className="grid gap-2">
            <Label htmlFor="location">장소 *</Label>
            <Input
              id="location"
              placeholder="예: 서울특별시 광화문"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

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
            <Label htmlFor="registration_url">신청 링크</Label>
            <Input
              id="registration_url"
              placeholder="https://..."
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
            />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : (
              "등록하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

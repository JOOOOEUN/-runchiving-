"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Registration } from "@/lib/types"

interface RegistrationActionsProps {
  registration: Registration & { race: any }
}

export function RegistrationActions({ registration }: RegistrationActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [bibNumber, setBibNumber] = useState(registration.bib_number || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdateBibNumber = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("registrations").update({ bib_number: bibNumber }).eq("id", registration.id)

      if (error) throw error

      setShowEditDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      alert("배번호 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("정말 신청을 취소하시겠습니까?")) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("registrations").update({ status: "cancelled" }).eq("id", registration.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Cancel error:", error)
      alert("취소 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">더보기</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            배번호 수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCancel} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            신청 취소
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배번호 수정</DialogTitle>
            <DialogDescription>대회 배번호를 입력하세요</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bib">배번호</Label>
              <Input
                id="bib"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                placeholder="예: A1234"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading}>
              취소
            </Button>
            <Button onClick={handleUpdateBibNumber} disabled={isLoading}>
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

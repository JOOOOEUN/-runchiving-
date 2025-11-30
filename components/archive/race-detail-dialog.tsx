"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Timer, Wind, ChevronRight, Trash2, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EditRecordDialog } from "./edit-record-dialog"

interface RaceRecord {
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
  weather: string
  location: string
}

export function RaceDetailDialog({ record }: { record: RaceRecord }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("records")
        .delete()
        .eq("id", record.id)

      if (error) throw error

      // 삭제 성공 시 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error("Delete error:", error)
      alert("삭제 중 오류가 발생했습니다.")
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs hover:text-primary">
          상세보기 <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          {/* Left: Visuals */}
          <div className="bg-muted/30 p-6 flex flex-col items-center justify-center border-r border-border/50">
            <div className="relative aspect-square w-full max-w-[240px]">
              <img
                src={record.medalImage || "/placeholder.svg"}
                alt="Medal"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
            {record.certificateImage && (
              <div className="mt-4 w-full">
                <p className="mb-2 text-xs font-medium text-muted-foreground">기록증</p>
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-border/50 bg-background">
                  <img
                    src={record.certificateImage || "/placeholder.svg"}
                    alt="Certificate"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col p-6">
            <DialogHeader className="mb-6 text-left">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="border-primary text-primary">
                  {record.distance}
                </Badge>
                <span className="text-sm text-muted-foreground">{record.date}</span>
              </div>
              <DialogTitle className="text-2xl font-bold leading-tight">{record.raceName}</DialogTitle>
              <DialogDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {record.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span>기록</span>
                  </div>
                  <p className="font-mono text-xl font-bold text-primary">{record.finishTime}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Wind className="h-3 w-3" />
                    <span>페이스</span>
                  </div>
                  <p className="font-mono text-xl font-bold">{record.pace} /km</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">대회 정보</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">순위</span>
                    <span className="font-medium">{record.position > 0 ? `${record.position}위` : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">날씨</span>
                    <span className="font-medium">{record.weather || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Placeholder for Comparison Graph */}
              <div className="pt-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">기록 비교</h4>
                <div className="h-24 w-full rounded-lg bg-muted/30 p-2 flex items-end justify-between gap-2">
                  {/* Mock Graph Bars */}
                  <div className="w-full bg-primary/20 rounded-t h-[60%]" title="2022"></div>
                  <div className="w-full bg-primary/40 rounded-t h-[80%]" title="2023"></div>
                  <div className="w-full bg-primary rounded-t h-[100%]" title="2024"></div>
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground px-1">
                  <span>'22</span>
                  <span>'23</span>
                  <span>'24</span>
                </div>
              </div>

              {/* 수정/삭제 버튼 */}
              <div className="pt-4 border-t border-border/50 space-y-2">
                <EditRecordDialog record={record} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      기록 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>기록을 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{record.raceName}" 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "삭제 중..." : "삭제"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

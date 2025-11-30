"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Medal, FileText, ImageIcon } from "lucide-react"
import { RaceArchiveCard } from "./race-archive-card"
import { cn } from "@/lib/utils"

type ViewMode = "medal" | "certificate" | "photo"

interface RecordData {
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

interface RecordsViewSwitcherProps {
  records: RecordData[]
}

export function RecordsViewSwitcher({ records }: RecordsViewSwitcherProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("medal")

  return (
    <div>
      {/* 뷰 전환 버튼 */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">보기:</span>
        <div className="flex rounded-lg border border-border bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("medal")}
            className={cn(
              "gap-2 px-3",
              viewMode === "medal" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <Medal className="h-4 w-4" />
            메달
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("certificate")}
            className={cn(
              "gap-2 px-3",
              viewMode === "certificate" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            기록증
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("photo")}
            className={cn(
              "gap-2 px-3",
              viewMode === "photo" && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <ImageIcon className="h-4 w-4" />
            사진
          </Button>
        </div>
      </div>

      {/* 그리드 뷰 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <RaceArchiveCard key={record.id} record={record} defaultTab={viewMode} />
        ))}
      </div>
    </div>
  )
}

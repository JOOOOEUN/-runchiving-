"use client"

import { Medal } from "lucide-react"

interface GeneratedCertificateProps {
  raceName: string
  date: string
  distance: string
  finishTime: string
  pace?: string
  position?: number
  location?: string
}

export function GeneratedCertificate({
  raceName,
  date,
  distance,
  finishTime,
  pace,
  position,
  location,
}: GeneratedCertificateProps) {
  // 날짜 포맷팅
  const formattedDate = new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // 페이스 포맷팅 (00:05:30 -> 5'30")
  const formatPace = (paceStr?: string) => {
    if (!paceStr) return null
    const parts = paceStr.split(":")
    if (parts.length >= 3) {
      const min = parseInt(parts[1])
      const sec = parseInt(parts[2])
      return `${min}'${sec.toString().padStart(2, "0")}"`
    }
    return null
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4">
      <div className="relative w-full max-w-[280px] rounded-lg border-4 border-double border-amber-600/50 bg-white/80 dark:bg-black/40 p-6 text-center shadow-lg">
        {/* 상단 장식 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 px-4 py-1 rounded-full">
          <span className="text-xs font-bold text-white tracking-wider">FINISHER</span>
        </div>

        {/* 메달 아이콘 */}
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
          <Medal className="h-6 w-6 text-white" />
        </div>

        {/* 대회명 */}
        <h3 className="mb-1 text-lg font-bold text-foreground leading-tight">{raceName}</h3>

        {/* 날짜 & 장소 */}
        <p className="text-xs text-muted-foreground mb-3">{formattedDate}</p>
        {location && <p className="text-xs text-muted-foreground -mt-2 mb-3">{location}</p>}

        {/* 구분선 */}
        <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* 기록 */}
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">거리</p>
            <p className="text-lg font-bold text-primary">{distance}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">완주 기록</p>
            <p className="text-2xl font-mono font-black text-foreground">{finishTime}</p>
          </div>
          {formatPace(pace) && (
            <div>
              <p className="text-xs text-muted-foreground">평균 페이스</p>
              <p className="text-sm font-semibold text-muted-foreground">{formatPace(pace)}/km</p>
            </div>
          )}
          {position && position > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">순위</p>
              <p className="text-sm font-semibold text-muted-foreground">#{position}</p>
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
          <p className="text-[10px] text-muted-foreground/60 tracking-wider">RUNCHIVING</p>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Trophy, Calendar, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

interface RecordWithRace {
  id: string
  finish_time: string
  completed_at: string
  distance: string | null
  race: {
    name: string
    distance: string
    date: string
  } | null
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's records with race info
  const { data: records } = await supabase
    .from("records")
    .select("id, finish_time, completed_at, distance, race:races(name, distance, date)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  const formatTime = (interval: string) => {
    const match = interval.match(/(\d+):(\d+):(\d+)/)
    if (!match) return interval
    const [, hours, minutes, seconds] = match
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
  }

  const parseTimeToSeconds = (interval: string) => {
    const match = interval.match(/(\d+):(\d+):(\d+)/)
    if (!match) return 0
    const [, hours, minutes, seconds] = match
    return Number.parseInt(hours) * 3600 + Number.parseInt(minutes) * 60 + Number.parseInt(seconds)
  }

  // 거리 정규화 함수
  const normalizeDistance = (distance: string | null | undefined): string => {
    if (!distance) return "기타"
    const d = distance.toLowerCase()
    if (d === "full" || d === "풀코스" || d === "풀" || d.includes("42")) return "Full"
    if (d === "half" || d === "하프" || d.includes("21")) return "Half"
    if (d === "10k" || d.includes("10")) return "10K"
    if (d === "5k" || d.includes("5")) return "5K"
    if (d === "울트라" || d.includes("ultra") || d.includes("50") || d.includes("100")) return "Ultra"
    return distance
  }

  // 기록의 실제 거리 가져오기 (record.distance 우선, 없으면 race.distance)
  const getRecordDistance = (record: RecordWithRace): string => {
    return normalizeDistance(record.distance || record.race?.distance)
  }

  // Group records by year
  const recordsByYear: Record<string, RecordWithRace[]> = {}
  records?.forEach((record) => {
    const year = new Date(record.completed_at).getFullYear().toString()
    if (!recordsByYear[year]) {
      recordsByYear[year] = []
    }
    recordsByYear[year].push(record as RecordWithRace)
  })

  // Calculate stats per year
  const yearStats = Object.entries(recordsByYear).map(([year, yearRecords]) => {
    const totalRaces = yearRecords.length
    const fullMarathons = yearRecords.filter((r) => getRecordDistance(r) === "Full")
    const halfMarathons = yearRecords.filter((r) => getRecordDistance(r) === "Half")

    // Calculate average time for full marathons
    let avgFullTime = null
    if (fullMarathons.length > 0) {
      const totalSeconds = fullMarathons.reduce((sum, r) => sum + parseTimeToSeconds(r.finish_time), 0)
      avgFullTime = totalSeconds / fullMarathons.length
    }

    // Get best time for full marathons
    let bestFullTime = null
    if (fullMarathons.length > 0) {
      const times = fullMarathons.map((r) => parseTimeToSeconds(r.finish_time))
      bestFullTime = Math.min(...times)
    }

    return {
      year,
      totalRaces,
      fullMarathons: fullMarathons.length,
      halfMarathons: halfMarathons.length,
      avgFullTime,
      bestFullTime,
      records: yearRecords,
    }
  })

  const secondsToTimeString = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Sort by year ascending for improvement calculation
  const sortedYearStats = [...yearStats].sort((a, b) => Number(a.year) - Number(b.year))

  // Calculate improvement from previous year
  const statsWithImprovement = sortedYearStats.map((stat, index) => {
    if (index === 0 || !stat.avgFullTime) {
      return { ...stat, improvement: null }
    }

    const prevYear = sortedYearStats[index - 1]
    if (!prevYear.avgFullTime) {
      return { ...stat, improvement: null }
    }

    const diff = prevYear.avgFullTime - stat.avgFullTime
    const percentage = (diff / prevYear.avgFullTime) * 100

    return {
      ...stat,
      improvement: {
        seconds: diff,
        percentage,
        improved: diff > 0,
      },
    }
  })

  // Reverse for display (newest first)
  const displayStats = [...statsWithImprovement].reverse()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">성장 타임라인</h1>
          <p className="text-lg text-muted-foreground">연도별 러닝 기록을 확인하고 성장 과정을 돌아보세요</p>
        </div>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="timeline">타임라인</TabsTrigger>
            <TabsTrigger value="statistics">통계</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            {displayStats.length > 0 ? (
              <div className="space-y-8">
                {displayStats.map((yearStat) => (
                  <Card key={yearStat.year}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl">{yearStat.year}</CardTitle>
                        <Badge variant="secondary" className="text-base">
                          총 {yearStat.totalRaces}회 완주
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Stats Grid */}
                      <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-muted p-4">
                          <p className="mb-1 text-sm text-muted-foreground">풀코스</p>
                          <p className="text-2xl font-bold">{yearStat.fullMarathons}회</p>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                          <p className="mb-1 text-sm text-muted-foreground">하프</p>
                          <p className="text-2xl font-bold">{yearStat.halfMarathons}회</p>
                        </div>

                        {yearStat.bestFullTime && (
                          <div className="rounded-lg bg-primary/10 p-4">
                            <p className="mb-1 text-sm text-muted-foreground">풀코스 최고 기록</p>
                            <p className="font-mono text-2xl font-bold text-primary">
                              {secondsToTimeString(yearStat.bestFullTime)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Improvement Badge */}
                      {yearStat.improvement && yearStat.avgFullTime && (
                        <div className="mb-6 flex items-center gap-3">
                          <p className="text-sm font-medium">평균 기록:</p>
                          <p className="font-mono text-lg font-semibold">{secondsToTimeString(yearStat.avgFullTime)}</p>
                          {yearStat.improvement.improved ? (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                              <TrendingUp className="h-3 w-3" />
                              {Math.abs(yearStat.improvement.percentage).toFixed(1)}% 향상
                            </Badge>
                          ) : yearStat.improvement.percentage < -0.5 ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" />
                              {Math.abs(yearStat.improvement.percentage).toFixed(1)}% 저하
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Minus className="h-3 w-3" />
                              비슷한 수준
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Records List */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">완주한 대회</h3>
                        <div className="space-y-2">
                          {yearStat.records.map((record) => (
                            <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <Trophy className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{record.race?.name || "대회명 없음"}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(record.completed_at).toLocaleDateString("ko-KR", {
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-semibold">{formatTime(record.finish_time)}</p>
                                <Badge variant="outline" className="mt-1">
                                  {getRecordDistance(record)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-lg text-muted-foreground">아직 기록이 없습니다</p>
                  <p className="text-sm text-muted-foreground">
                    대회를 완주하고 기록을 추가하면 성장 과정을 확인할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            {records && records.length > 0 ? (
              <div className="space-y-6">
                {/* Yearly Participation Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      연도별 참가 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(recordsByYear)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([year, yearRecords]) => {
                          const maxRaces = Math.max(...Object.values(recordsByYear).map((r) => r.length))
                          const percentage = (yearRecords.length / maxRaces) * 100

                          return (
                            <div key={year} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{year}년</span>
                                <span className="text-muted-foreground">{yearRecords.length}회</span>
                              </div>
                              <div className="h-8 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Participation (Current Year) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      월별 참가 현황 (최근 1년)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1
                        const oneYearAgo = new Date()
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

                        const monthRecords = records.filter((r) => {
                          const recordDate = new Date(r.completed_at)
                          return recordDate >= oneYearAgo && recordDate.getMonth() + 1 === month
                        })

                        return (
                          <div
                            key={month}
                            className="flex flex-col items-center justify-center rounded-lg border p-3 transition-colors hover:bg-muted"
                          >
                            <span className="text-xs text-muted-foreground">{month}월</span>
                            <span className="mt-1 text-2xl font-bold text-primary">{monthRecords.length}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Distance Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>거리별 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Full", "Half", "10K", "5K", "Ultra"].map((distance) => {
                        const distanceRecords = records.filter((r) => getRecordDistance(r as RecordWithRace) === distance)
                        const percentage = records.length > 0 ? (distanceRecords.length / records.length) * 100 : 0

                        if (distanceRecords.length === 0) return null

                        const displayName = distance === "Full" ? "풀코스" :
                                           distance === "Half" ? "하프" :
                                           distance === "Ultra" ? "울트라" : distance

                        return (
                          <div key={distance} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{displayName}</span>
                              <span className="text-muted-foreground">
                                {distanceRecords.length}회 ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-lg text-muted-foreground">아직 통계 데이터가 없습니다</p>
                  <p className="text-sm text-muted-foreground">
                    대회를 완주하고 기록을 추가하면 통계를 확인할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Trophy, Calendar, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock Data for Timeline & Stats
const MOCK_RECORDS = [
  {
    id: "1",
    finish_time: "04:56:29",
    completed_at: "2025-10-26T10:00:00Z",
    race: {
      name: "2025 춘천마라톤",
      distance: "Full",
      date: "2025-10-26",
    },
  },
  {
    id: "2",
    finish_time: "00:56:42",
    completed_at: "2025-10-19T09:00:00Z",
    race: {
      name: "2025 STYLE RUN",
      distance: "10K",
      date: "2025-10-19",
    },
  },
  {
    id: "3",
    finish_time: "01:45:20",
    completed_at: "2024-10-13T08:00:00Z",
    race: {
      name: "2024 서울달리기",
      distance: "Half",
      date: "2024-10-13",
    },
  },
  {
    id: "4",
    finish_time: "00:58:10",
    completed_at: "2024-03-17T08:00:00Z",
    race: {
      name: "2024 서울마라톤",
      distance: "10K",
      date: "2024-03-17",
    },
  },
  {
    id: "5",
    finish_time: "02:05:15",
    completed_at: "2023-11-05T08:00:00Z",
    race: {
      name: "2023 JTBC 서울 마라톤",
      distance: "Half",
      date: "2023-11-05",
    },
  },
]

export default async function TimelinePage() {
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect("/auth/login")

  const records = MOCK_RECORDS

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

  // Group records by year
  const recordsByYear: Record<string, typeof records> = {}
  records?.forEach((record) => {
    const year = new Date(record.completed_at).getFullYear().toString()
    if (!recordsByYear[year]) {
      recordsByYear[year] = []
    }
    recordsByYear[year].push(record)
  })

  // Calculate stats per year
  const yearStats = Object.entries(recordsByYear).map(([year, yearRecords]) => {
    const totalRaces = yearRecords.length
    const fullMarathons = yearRecords.filter((r) => r.race.distance === "Full")
    const halfMarathons = yearRecords.filter((r) => r.race.distance === "Half")

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

  // Calculate improvement from previous year
  const statsWithImprovement = yearStats.map((stat, index) => {
    if (index === 0 || !stat.avgFullTime) {
      return { ...stat, improvement: null }
    }

    const prevYear = yearStats[index - 1]
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
            {statsWithImprovement.length > 0 ? (
              <div className="space-y-8">
                {statsWithImprovement.reverse().map((yearStat) => (
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
                                  <p className="font-medium">{record.race.name}</p>
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
                                  {record.race.distance}
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
                        .reverse()
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
                        const monthRecords = records.filter((r) => {
                          const recordDate = new Date(r.completed_at)
                          return recordDate.getMonth() + 1 === month
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
                      {["Full", "Half", "10K", "5K"].map((distance) => {
                        const distanceRecords = records.filter((r) => r.race.distance === distance)
                        const percentage = (distanceRecords.length / records.length) * 100

                        return (
                          <div key={distance} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{distance}</span>
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

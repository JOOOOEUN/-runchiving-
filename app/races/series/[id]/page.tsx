import { createClient } from "@/lib/supabase/server"
import type { RaceSeries, Race } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, Trophy, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { parseDistances, getDistanceBadgeStyle } from "@/lib/distance-utils"

const MONTH_NAMES = ["", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 시리즈 정보 가져오기
  const { data: series } = await supabase
    .from("race_series")
    .select("*")
    .eq("id", id)
    .single()

  if (!series) {
    notFound()
  }

  // 시리즈에 속한 대회들 가져오기 (최신순)
  const { data: races } = await supabase
    .from("races")
    .select("*")
    .eq("series_id", id)
    .order("date", { ascending: false })

  const distances = parseDistances(series.typical_distances || "")

  // 연도별로 그룹핑
  const racesByYear: Record<string, Race[]> = {}
  races?.forEach((race) => {
    const year = new Date(race.date).getFullYear().toString()
    if (!racesByYear[year]) {
      racesByYear[year] = []
    }
    racesByYear[year].push(race as Race)
  })

  const sortedYears = Object.keys(racesByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link href="/races/series" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          시리즈 목록으로
        </Link>

        {/* 시리즈 헤더 */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {series.logo_url && (
              <img
                src={series.logo_url}
                alt={series.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{series.name}</h1>
              {series.short_name && (
                <p className="text-lg text-muted-foreground mt-1">({series.short_name})</p>
              )}
            </div>
          </div>

          {series.description && (
            <p className="mt-4 text-lg text-muted-foreground">{series.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {series.typical_month && (
              <Badge variant="outline" className="gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                매년 {MONTH_NAMES[series.typical_month]} 개최
              </Badge>
            )}
            {races && races.length > 0 && (
              <Badge variant="secondary" className="gap-1 text-sm">
                <Trophy className="h-3.5 w-3.5" />
                총 {races.length}회 기록
              </Badge>
            )}
          </div>

          {distances.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {distances.map((d) => (
                <Badge key={d} variant="secondary" className={getDistanceBadgeStyle(d)}>
                  {d}
                </Badge>
              ))}
            </div>
          )}

          {series.official_url && (
            <div className="mt-4">
              <a
                href={series.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                공식 홈페이지 방문
              </a>
            </div>
          )}
        </div>

        {/* 연도별 대회 목록 */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">연도별 대회</h2>

          {sortedYears.length > 0 ? (
            sortedYears.map((year) => (
              <div key={year}>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary">{year}</span>
                  <Badge variant="outline">{racesByYear[year].length}개 대회</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {racesByYear[year].map((race) => {
                    const raceDistances = parseDistances(race.distance)
                    const raceDate = new Date(race.date)
                    const isPast = raceDate < new Date()

                    return (
                      <Link key={race.id} href={`/races/${race.id}`}>
                        <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold line-clamp-1">{race.name}</h4>
                                <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {raceDate.toLocaleDateString("ko-KR", {
                                      month: "long",
                                      day: "numeric",
                                      weekday: "short",
                                    })}
                                  </span>
                                  {race.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {race.location}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {raceDistances.map((d) => (
                                    <Badge
                                      key={d}
                                      variant="secondary"
                                      className={`text-xs ${getDistanceBadgeStyle(d)}`}
                                    >
                                      {d}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Badge variant={isPast ? "secondary" : "default"}>
                                {isPast ? "종료" : "예정"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">이 시리즈에 등록된 대회가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

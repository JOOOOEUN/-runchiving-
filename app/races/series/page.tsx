import { createClient } from "@/lib/supabase/server"
import type { RaceSeries } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ExternalLink, Trophy } from "lucide-react"
import Link from "next/link"
import { parseDistances, getDistanceBadgeStyle } from "@/lib/distance-utils"

const MONTH_NAMES = ["", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

export default async function SeriesListPage() {
  const supabase = await createClient()

  const { data: seriesList } = await supabase
    .from("race_series")
    .select("*")
    .order("typical_month", { ascending: true })

  // 각 시리즈별 대회 수 가져오기
  const { data: raceCounts } = await supabase
    .from("races")
    .select("series_id")
    .not("series_id", "is", null)

  const countMap: Record<string, number> = {}
  raceCounts?.forEach((r) => {
    if (r.series_id) {
      countMap[r.series_id] = (countMap[r.series_id] || 0) + 1
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">정기 대회 시리즈</h1>
          <p className="text-lg text-muted-foreground">
            매년 열리는 정기 마라톤 대회들을 모아보세요
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seriesList && seriesList.length > 0 ? (
            seriesList.map((series: RaceSeries) => {
              const distances = parseDistances(series.typical_distances || "")
              const raceCount = countMap[series.id] || 0

              return (
                <Link key={series.id} href={`/races/series/${series.id}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{series.name}</CardTitle>
                          {series.short_name && (
                            <p className="text-sm text-muted-foreground mt-1">
                              ({series.short_name})
                            </p>
                          )}
                        </div>
                        {series.logo_url && (
                          <img
                            src={series.logo_url}
                            alt={series.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {series.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {series.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {series.typical_month && (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            매년 {MONTH_NAMES[series.typical_month]}
                          </Badge>
                        )}
                        {raceCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {raceCount}회 개최
                          </Badge>
                        )}
                      </div>

                      {distances.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {distances.map((d) => (
                            <Badge
                              key={d}
                              variant="secondary"
                              className={getDistanceBadgeStyle(d)}
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {series.official_url && (
                        <div className="pt-2 border-t">
                          <a
                            href={series.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            공식 홈페이지
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">등록된 시리즈가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">
                시리즈 데이터를 추가하려면 SQL 스크립트를 실행해주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  ExternalLink,
  CloudSun,
  Plus,
  ImageIcon,
  Clock,
  Building2,
  Wallet,
  Gift,
  Medal,
  Shirt,
  Map,
  Trophy,
  ArrowRight,
} from "lucide-react"
import { AddToMyRacesButton } from "@/components/add-to-my-races-button"
import { RaceDetailActions } from "@/components/race-detail-actions"
import Link from "next/link"
import Image from "next/image"
import { parseDistances, getDistanceBadgeStyle } from "@/lib/distance-utils"
import type { Race, RaceSeries } from "@/lib/types"

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: race, error } = await supabase
    .from("races")
    .select("*, series:race_series(*)")
    .eq("id", id)
    .single()

  if (error || !race) {
    notFound()
  }

  // 시리즈가 있으면 같은 시리즈의 다른 대회들 가져오기
  let seriesRaces: Race[] = []
  if (race.series_id) {
    const { data } = await supabase
      .from("races")
      .select("*")
      .eq("series_id", race.series_id)
      .neq("id", race.id)
      .order("date", { ascending: false })
      .limit(5)
    seriesRaces = (data || []) as Race[]
  }

  const series = race.series as RaceSeries | null

  const raceDate = new Date(race.date)
  const formattedDate = raceDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const registrationStart = formatDate(race.registration_start)
  const registrationDeadline = formatDate(race.registration_deadline)

  // D-Day 계산
  const today = new Date()
  const diffTime = raceDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let dDayText = ""
  let dDayClass = ""
  if (diffDays < 0) {
    dDayText = "종료"
    dDayClass = "bg-gray-500"
  } else if (diffDays === 0) {
    dDayText = "D-Day"
    dDayClass = "bg-red-500"
  } else if (diffDays <= 7) {
    dDayText = `D-${diffDays}`
    dDayClass = "bg-orange-500"
  } else if (diffDays <= 30) {
    dDayText = `D-${diffDays}`
    dDayClass = "bg-blue-500"
  } else {
    dDayText = `D-${diffDays}`
    dDayClass = "bg-green-500"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 기록 추가 배너 */}
      <div className="border-b border-primary/20 bg-primary/5 py-2">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4">
          <span className="text-sm text-muted-foreground">이 대회에 참가하셨나요?</span>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <Link href={`/dashboard/records/new?race=${race.id}`}>
              <Plus className="h-3 w-3" />
              기록 추가
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* 포스터 이미지 */}
          <div className="relative aspect-[3/4] w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg">
            {race.poster_url ? (
              <Image
                src={race.poster_url}
                alt={`${race.name} 포스터`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-orange-500/10">
                <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">포스터 없음</span>
              </div>
            )}
            {/* D-Day 배지 */}
            <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-bold text-white ${dDayClass}`}>
              {dDayText}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {parseDistances(race.distance).map((d, idx) => (
                  <Badge key={idx} className={`text-sm ${getDistanceBadgeStyle(d)}`}>
                    {d}
                  </Badge>
                ))}
                <RaceDetailActions race={race} />
              </div>
              <h1 className="text-3xl font-bold lg:text-4xl">{race.name}</h1>
              {race.organizer && (
                <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {race.organizer}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{race.location}</span>
              </div>
            </div>

            {/* 빠른 정보 */}
            <div className="flex flex-wrap gap-3">
              {race.max_participants && (
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{race.max_participants.toLocaleString()}명</span>
                </div>
              )}
              {race.difficulty && (
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>{race.difficulty}</span>
                </div>
              )}
              {race.elevation_gain && (
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{race.elevation_gain}m</span>
                </div>
              )}
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-wrap gap-3 pt-2">
              <AddToMyRacesButton raceId={race.id} size="lg" />
              {race.registration_url && (
                <Button asChild variant="outline" size="lg">
                  <a
                    href={race.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    공식 사이트
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 시리즈 정보 */}
        {series && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">정기 대회 시리즈</p>
                    <p className="font-semibold">{series.name} {series.short_name && `(${series.short_name})`}</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link href={`/races/series/${series.id}`}>
                    시리즈 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {seriesRaces.length > 0 && (
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <p className="text-sm text-muted-foreground mb-2">이 시리즈의 다른 대회</p>
                  <div className="flex flex-wrap gap-2">
                    {seriesRaces.map((r) => (
                      <Link key={r.id} href={`/races/${r.id}`}>
                        <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                          {new Date(r.date).getFullYear()}년
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 탭 콘텐츠 */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="info">대회 정보</TabsTrigger>
            <TabsTrigger value="course">코스</TabsTrigger>
            <TabsTrigger value="benefits">기념품</TabsTrigger>
            <TabsTrigger value="schedule">일정</TabsTrigger>
          </TabsList>

          {/* 대회 정보 탭 */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 접수 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    접수 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(registrationStart || registrationDeadline) ? (
                    <>
                      {registrationStart && (
                        <div>
                          <p className="text-sm text-muted-foreground">접수 시작</p>
                          <p className="font-medium">{registrationStart}</p>
                        </div>
                      )}
                      {registrationDeadline && (
                        <div>
                          <p className="text-sm text-muted-foreground">접수 마감</p>
                          <p className="font-medium">{registrationDeadline}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">접수 정보가 등록되지 않았습니다.</p>
                  )}
                  {race.max_participants && (
                    <div>
                      <p className="text-sm text-muted-foreground">모집 인원</p>
                      <p className="font-medium">{race.max_participants.toLocaleString()}명</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 참가비 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    참가비
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {race.entry_fee && Object.keys(race.entry_fee).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(race.entry_fee).map(([distance, fee]) => (
                        <div key={distance} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                          <span className="font-medium">{distance}</span>
                          <span className="text-primary font-bold">{Number(fee).toLocaleString()}원</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">참가비 정보가 등록되지 않았습니다.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 주최/주관 정보 */}
            {race.organizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    주최/주관
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{race.organizer}</p>
                </CardContent>
              </Card>
            )}

            {/* 날씨 정보 */}
            {race.weather_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudSun className="h-5 w-5" />
                    날씨 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{race.weather_notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 코스 탭 */}
          <TabsContent value="course" className="space-y-6">
            {/* 코스 지도 */}
            {race.course_map_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    코스 지도
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={race.course_map_url}
                      alt="코스 지도"
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 코스 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>코스 설명</CardTitle>
              </CardHeader>
              <CardContent>
                {race.course_description ? (
                  <p className="whitespace-pre-wrap text-muted-foreground">{race.course_description}</p>
                ) : (
                  <p className="text-muted-foreground">코스 설명이 등록되지 않았습니다.</p>
                )}
              </CardContent>
            </Card>

            {/* 코스 난이도 */}
            {(race.difficulty || race.elevation_gain) && (
              <Card>
                <CardHeader>
                  <CardTitle>코스 난이도</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {race.difficulty && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">난이도</p>
                      <Badge variant="outline" className="text-base">{race.difficulty}</Badge>
                    </div>
                  )}
                  {race.elevation_gain && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">총 상승 고도</p>
                      <p className="text-2xl font-bold text-primary">+{race.elevation_gain}m</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 기념품 탭 */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 완주 메달 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    완주 메달
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {race.medal_image_url ? (
                    <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={race.medal_image_url}
                        alt="완주 메달"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Medal className="h-12 w-12 mb-2" />
                      <p className="text-sm">메달 이미지가 등록되지 않았습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 기념 티셔츠 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5" />
                    기념 티셔츠
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {race.tshirt_image_url ? (
                    <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={race.tshirt_image_url}
                        alt="기념 티셔츠"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Shirt className="h-12 w-12 mb-2" />
                      <p className="text-sm">티셔츠 이미지가 등록되지 않았습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 참가 혜택 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  참가 혜택 & 기념품
                </CardTitle>
              </CardHeader>
              <CardContent>
                {race.benefits ? (
                  <p className="whitespace-pre-wrap text-muted-foreground">{race.benefits}</p>
                ) : (
                  <p className="text-muted-foreground">참가 혜택 정보가 등록되지 않았습니다.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 일정 탭 */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  대회 당일 일정
                </CardTitle>
              </CardHeader>
              <CardContent>
                {race.schedule && Object.keys(race.schedule).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(race.schedule)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([time, event]) => (
                        <div key={time} className="flex items-start gap-4 rounded-lg border p-3">
                          <span className="shrink-0 rounded bg-primary/10 px-2 py-1 font-mono text-sm font-bold text-primary">
                            {time}
                          </span>
                          <span className="text-muted-foreground">{event}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">일정 정보가 등록되지 않았습니다.</p>
                )}
              </CardContent>
            </Card>

            {/* 접수 일정 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>접수 일정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {registrationStart && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">접수 시작</span>
                    <span className="font-medium">{registrationStart}</span>
                  </div>
                )}
                {registrationDeadline && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground">접수 마감</span>
                    <span className="font-medium">{registrationDeadline}</span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                  <span className="text-muted-foreground">대회일</span>
                  <span className="font-bold text-primary">{formattedDate}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

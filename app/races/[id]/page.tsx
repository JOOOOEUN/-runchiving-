import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, TrendingUp, Users, ExternalLink, CloudSun, Plus, ImageIcon } from "lucide-react"
import { AddToMyRacesButton } from "@/components/add-to-my-races-button"
import Link from "next/link"
import Image from "next/image"
import { normalizeDistance, parseDistances, getDistanceBadgeStyle } from "@/lib/distance-utils"

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: race, error } = await supabase.from("races").select("*").eq("id", id).single()

  if (error || !race) {
    notFound()
  }

  const raceDate = new Date(race.date)
  const formattedDate = raceDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const registrationDeadline = race.registration_deadline
    ? new Date(race.registration_deadline).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* 포스터 이미지 */}
          <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg bg-muted lg:order-first">
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
          </div>

          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold">{race.name}</h1>
              <div className="flex gap-1">
                {parseDistances(race.distance).map((d, idx) => (
                  <Badge key={idx} className={`text-sm ${getDistanceBadgeStyle(d)}`}>
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{race.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>코스 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty">
                  {race.course_description || "코스 설명이 없습니다."}
                </p>
              </CardContent>
            </Card>

            {race.weather_notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudSun className="h-5 w-5" />
                    날씨 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-pretty">{race.weather_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>대회 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {race.difficulty && (
                  <div>
                    <p className="mb-1 text-sm font-medium">난이도</p>
                    <Badge variant="outline">{race.difficulty}</Badge>
                  </div>
                )}

                {race.elevation_gain && (
                  <div>
                    <p className="mb-1 text-sm font-medium">총 상승고도</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{race.elevation_gain}m</span>
                    </div>
                  </div>
                )}

                {race.max_participants && (
                  <div>
                    <p className="mb-1 text-sm font-medium">최대 참가인원</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{race.max_participants.toLocaleString()}명</span>
                    </div>
                  </div>
                )}

                {registrationDeadline && (
                  <div>
                    <p className="mb-1 text-sm font-medium">신청 마감일</p>
                    <p className="text-muted-foreground">{registrationDeadline}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <AddToMyRacesButton raceId={race.id} size="lg" className="w-full" />
              {race.registration_url && (
                <Button asChild variant="outline">
                  <a
                    href={race.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    공식 사이트에서 신청
                  </a>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link href={`/dashboard/records/new?race=${race.id}`} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  기록 추가
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

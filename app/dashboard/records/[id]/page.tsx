import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, Trophy, MapPin, Clock, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: record, error } = await supabase
    .from("records")
    .select("*, race:races(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !record) {
    notFound()
  }

  const formatTime = (interval: string) => {
    const match = interval.match(/(\d+):(\d+):(\d+)/)
    if (!match) return interval
    const [, hours, minutes, seconds] = match
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard/records">
            <ArrowLeft className="mr-2 h-4 w-4" />
            기록 목록으로
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Photos */}
            <Card>
              <CardContent className="p-0">
                {record.medal_photo_url ? (
                  <img
                    src={record.medal_photo_url || "/placeholder.svg"}
                    alt="Medal"
                    className="h-64 w-full rounded-t-lg object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-t-lg bg-muted">
                    <Trophy className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h1 className="mb-2 text-3xl font-bold text-balance">{record.race.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{record.race.location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {record.race.distance}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(record.completed_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Race Photo */}
            {record.photo_url && (
              <Card>
                <CardHeader>
                  <CardTitle>완주 사진</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={record.photo_url || "/placeholder.svg"} alt="Race finish" className="w-full rounded-lg" />
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {record.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>메모</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground text-pretty">{record.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기록 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>완주 시간</span>
                  </div>
                  <p className="font-mono text-3xl font-bold">{formatTime(record.finish_time)}</p>
                </div>

                {record.pace && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>평균 페이스</span>
                    </div>
                    <p className="font-mono text-xl font-semibold">{formatTime(record.pace)} /km</p>
                  </div>
                )}

                {record.position && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>순위</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{record.position}위</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>대회 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {record.race.difficulty && (
                  <div>
                    <p className="mb-1 text-sm font-medium">난이도</p>
                    <Badge variant="outline">{record.race.difficulty}</Badge>
                  </div>
                )}

                {record.race.elevation_gain && (
                  <div>
                    <p className="mb-1 text-sm font-medium">총 상승고도</p>
                    <p className="text-muted-foreground">{record.race.elevation_gain}m</p>
                  </div>
                )}

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/races/${record.race_id}`}>대회 상세보기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

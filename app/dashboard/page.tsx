import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Calendar, TrendingUp, Link2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user stats
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, race:races(*)")
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false })

  const { data: records } = await supabase.from("records").select("*").eq("user_id", user.id)

  // Check Strava connection
  const { data: stravaConnection } = await supabase
    .from("strava_connections")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const upcomingRaces = registrations?.filter(
    (reg) => reg.status === "registered" && new Date(reg.race.date) > new Date(),
  )

  const completedRaces = registrations?.filter((reg) => reg.status === "completed")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">대시보드</h1>
          <p className="text-lg text-muted-foreground">러닝 활동을 한눈에 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">예정된 대회</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingRaces?.length || 0}</div>
              <p className="text-xs text-muted-foreground">신청한 대회</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">완주한 대회</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedRaces?.length || 0}</div>
              <p className="text-xs text-muted-foreground">기록 저장됨</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 기록</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{records?.length || 0}</div>
              <p className="text-xs text-muted-foreground">저장된 기록</p>
            </CardContent>
          </Card>
        </div>

        {/* Strava Connection Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              연동 서비스
            </CardTitle>
            <CardDescription>외부 서비스와 연동하여 기록을 자동으로 가져오세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#FC4C02] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Strava</p>
                  <p className="text-sm text-muted-foreground">
                    {stravaConnection
                      ? `연동됨 - ${stravaConnection.athlete_data?.firstname || ''} ${stravaConnection.athlete_data?.lastname || ''}`
                      : "활동 기록을 자동으로 가져옵니다"
                    }
                  </p>
                </div>
              </div>
              {stravaConnection ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-500 font-medium">연동됨</span>
                </div>
              ) : (
                <Button asChild className="bg-[#FC4C02] hover:bg-[#FC4C02]/90">
                  <a href="/api/strava/auth">Strava 연동하기</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>빠른 시작</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/races">대회 찾아보기</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/dashboard/records/new">새 기록 추가</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>내 활동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/registrations">
                  <Calendar className="mr-2 h-4 w-4" />
                  신청 현황 보기
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/records">
                  <Trophy className="mr-2 h-4 w-4" />
                  기록 아카이브
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/dashboard/timeline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  성장 타임라인
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Races */}
        {upcomingRaces && upcomingRaces.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>다가오는 대회</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingRaces.slice(0, 3).map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-semibold">{reg.race.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reg.race.date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/races/${reg.race_id}`}>상세보기</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

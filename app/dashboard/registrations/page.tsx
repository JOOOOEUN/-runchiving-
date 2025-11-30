import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { RegistrationActions } from "@/components/registration-actions"

// Mock Data for Registrations
const MOCK_REGISTRATIONS = [
  {
    id: "1",
    status: "registered",
    registered_at: "2025-01-15T10:00:00Z",
    bib_number: "13280",
    race_id: "race-1",
    race: {
      id: "race-1",
      name: "2025 춘천마라톤",
      date: "2025-10-26",
      location: "춘천 공지천",
      distance: "Full",
    },
  },
  {
    id: "2",
    status: "completed",
    registered_at: "2025-08-20T10:00:00Z",
    bib_number: "1561",
    race_id: "race-2",
    race: {
      id: "race-2",
      name: "2025 STYLE RUN",
      date: "2025-10-19",
      location: "잠실 롯데월드몰",
      distance: "10K",
    },
  },
  {
    id: "3",
    status: "completed",
    registered_at: "2024-08-01T10:00:00Z",
    bib_number: "890",
    race_id: "race-3",
    race: {
      id: "race-3",
      name: "2024 서울달리기",
      date: "2024-10-13",
      location: "서울광장",
      distance: "Half",
    },
  },
]

export default async function RegistrationsPage() {
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect("/auth/login")

  const registrations = MOCK_REGISTRATIONS

  const upcoming = registrations?.filter((reg) => reg.status === "registered" && new Date(reg.race.date) > new Date())

  const past = registrations?.filter((reg) => reg.status !== "cancelled" && new Date(reg.race.date) <= new Date())

  const cancelled = registrations?.filter((reg) => reg.status === "cancelled")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">신청 현황</h1>
          <p className="text-lg text-muted-foreground">참가 신청한 대회를 관리하세요</p>
        </div>

        {/* Upcoming Races */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">예정된 대회</h2>
          {upcoming && upcoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((reg) => (
                <Card key={reg.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl text-balance">{reg.race.name}</CardTitle>
                      <Badge variant="secondary">{reg.race.distance}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(reg.race.date).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{reg.race.location}</span>
                      </div>
                    </div>
                    {reg.bib_number && (
                      <div>
                        <span className="text-sm font-medium">배번호: </span>
                        <span className="text-sm text-muted-foreground">{reg.bib_number}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/races/${reg.race_id}`}>상세보기</Link>
                      </Button>
                      <RegistrationActions registration={reg} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">예정된 대회가 없습니다</p>
                <Button asChild>
                  <Link href="/races">대회 찾아보기</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Races */}
        {past && past.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">지난 대회</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((reg) => (
                <Card key={reg.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl text-balance">{reg.race.name}</CardTitle>
                      <Badge variant={reg.status === "completed" ? "default" : "secondary"}>
                        {reg.status === "completed" ? "완주" : reg.race.distance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(reg.race.date).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Link href={`/dashboard/records/new?registration=${reg.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          기록 추가하기
                        </Link>
                      </Button>
                      {reg.status === "completed" && (
                        <Button asChild size="sm" variant="ghost">
                          <Link href="/dashboard/records">아카이브 보기</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

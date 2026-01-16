import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HallOfFame } from "@/components/archive/hall-of-fame"
import { RecordsViewSwitcher } from "@/components/archive/records-view-switcher"

export default async function RecordsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's records with race info
  const { data: records } = await supabase
    .from("records")
    .select("*, race:races(*)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })

  // Calculate PBs from records
  const calculatePBs = () => {
    const pbs: { full?: string; half?: string; tenK?: string; fiveK?: string } = {}

    if (!records || records.length === 0) return pbs

    // record.distance를 사용 (개인이 실제 참가한 거리)
    const fullRecords = records.filter(r => r.distance === "Full" || r.distance === "풀코스")
    const halfRecords = records.filter(r => r.distance === "Half" || r.distance === "하프")
    const tenKRecords = records.filter(r => r.distance === "10K")
    const fiveKRecords = records.filter(r => r.distance === "5K")

    if (fullRecords.length > 0) {
      const best = fullRecords.reduce((min, r) => r.finish_time < min.finish_time ? r : min)
      pbs.full = best.finish_time
    }
    if (halfRecords.length > 0) {
      const best = halfRecords.reduce((min, r) => r.finish_time < min.finish_time ? r : min)
      pbs.half = best.finish_time
    }
    if (tenKRecords.length > 0) {
      const best = tenKRecords.reduce((min, r) => r.finish_time < min.finish_time ? r : min)
      pbs.tenK = best.finish_time
    }
    if (fiveKRecords.length > 0) {
      const best = fiveKRecords.reduce((min, r) => r.finish_time < min.finish_time ? r : min)
      pbs.fiveK = best.finish_time
    }

    return pbs
  }

  const pbs = calculatePBs()

  // Transform records to match card component format
  const transformedRecords = records?.map(record => ({
    id: record.id,
    raceName: record.race?.name || "Unknown Race",
    date: record.completed_at || record.race?.date,
    distance: record.distance || record.race?.distance?.split(", ")[0] || "",
    raceDistances: record.race?.distance || "",
    finishTime: record.finish_time || "",
    pace: record.pace || "",
    position: record.position || 0,
    medalImage: record.medal_photo_url || "",
    certificateImage: record.certificate_photo_url || null,
    photos: record.photo_url ? [record.photo_url] : [],
    weather: "",
    location: record.race?.location || "",
  })) || []

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/40 bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">나의 기록 아카이브</h1>
              <p className="mt-2 text-muted-foreground">땀방울로 써내려간 당신의 러닝 히스토리</p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard/records/new">
                <Plus className="mr-2 h-4 w-4" />새 기록 추가
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hall of Fame Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-1 bg-primary" />
            <h2 className="text-2xl font-bold">HALL OF FAME</h2>
            <span className="text-sm text-muted-foreground">개인 최고 기록 (PB)</span>
          </div>
          <HallOfFame pbs={pbs} />
        </section>

        {/* Race Archive Section */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-1 bg-primary" />
            <h2 className="text-2xl font-bold">RACE ARCHIVE</h2>
            <span className="text-sm text-muted-foreground">완주 메달 컬렉션</span>
          </div>

          {transformedRecords.length > 0 ? (
            <RecordsViewSwitcher records={transformedRecords} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 py-16">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">아직 기록이 없어요</h3>
              <p className="mb-4 text-sm text-muted-foreground">첫 번째 완주 기록을 추가해보세요!</p>
              <Button asChild>
                <Link href="/dashboard/records/new">
                  <Plus className="mr-2 h-4 w-4" />새 기록 추가
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

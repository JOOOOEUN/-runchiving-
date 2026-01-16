import { createClient } from "@/lib/supabase/server"
import { RaceArchiveCard } from "@/components/archive/race-archive-card"
import { Users, Medal } from "lucide-react"

export default async function ExplorePage() {
  const supabase = await createClient()

  // 공개된 기록만 가져오기
  const { data: records } = await supabase
    .from("records")
    .select("*, race:races(*)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50)

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
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/5 to-orange-500/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">러너들의 기록</h1>
            <p className="mt-2 text-muted-foreground">다른 러너들의 완주 기록과 메달 컬렉션을 둘러보세요</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {transformedRecords.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {transformedRecords.length}개의 공개된 기록
                </span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {transformedRecords.map((record) => (
                <RaceArchiveCard key={record.id} record={record} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Medal className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">아직 공개된 기록이 없어요</h3>
            <p className="text-center text-sm text-muted-foreground">
              첫 번째로 기록을 공개해보세요!<br />
              다른 러너들에게 영감을 줄 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

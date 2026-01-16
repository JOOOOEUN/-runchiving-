import { createClient } from "@/lib/supabase/server"
import type { Race } from "@/lib/types"
import { RaceCard } from "@/components/race-card"
import { RaceFilters } from "@/components/race-filters"
import { SubmitRaceDialog } from "@/components/submit-race-dialog"

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ distance?: string; month?: string; sort?: string; region?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // 정렬: asc(기본) = 최신순(날짜 내림차순), desc = 과거순(날짜 오름차순)
  const isAscending = params.sort === "desc"
  let query = supabase.from("races").select("*").order("date", { ascending: isAscending })

  // Apply search query
  if (params.q) {
    query = query.ilike("name", `%${params.q}%`)
  }

  // Apply distance filter
  if (params.distance) {
    if (params.distance === "other") {
      // 기타: Full, Half, 10K, 5K가 아닌 것들
      query = query
        .not("distance", "ilike", "%Full%")
        .not("distance", "ilike", "%Half%")
        .not("distance", "ilike", "%10K%")
        .not("distance", "ilike", "%5K%")
        .not("distance", "ilike", "%풀코스%")
        .not("distance", "ilike", "%하프%")
    } else {
      query = query.ilike("distance", `%${params.distance}%`)
    }
  }

  // Apply region filter
  if (params.region) {
    query = query.ilike("location", `%${params.region}%`)
  }

  if (params.month) {
    const year = new Date().getFullYear()
    const startDate = `${year}-${params.month.padStart(2, "0")}-01`
    const endDate = `${year}-${params.month.padStart(2, "0")}-31`
    query = query.gte("date", startDate).lte("date", endDate)
  }

  const { data: races, error } = await query

  if (error) {
    console.error("Error fetching races:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">마라톤 일정</h1>
            <p className="text-lg text-muted-foreground">전국의 마라톤 대회 정보를 확인하세요</p>
          </div>
          <SubmitRaceDialog />
        </div>

        <RaceFilters />

        {/* Updated grid layout to single column for list view style on mobile, grid on desktop */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {races && races.length > 0 ? (
            races.map((race: Race) => <RaceCard key={race.id} race={race} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">대회 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

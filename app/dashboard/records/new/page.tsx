import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecordForm } from "@/components/record-form"

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's registrations for dropdown
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, race:races(*)")
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">새 기록 추가</h1>
          <p className="text-lg text-muted-foreground">완주한 대회의 기록을 추가하세요</p>
        </div>

        <RecordForm registrations={registrations || []} preselectedRegistrationId={params.registration} />
      </div>
    </div>
  )
}

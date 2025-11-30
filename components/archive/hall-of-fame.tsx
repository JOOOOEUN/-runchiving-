import { Card, CardContent } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface HallOfFameProps {
  pbs: {
    full?: string
    half?: string
    tenK?: string
    fiveK?: string
  }
}

export function HallOfFame({ pbs }: HallOfFameProps) {
  const records = [
    { distance: "FULL", time: pbs.full, label: "42.195km" },
    { distance: "HALF", time: pbs.half, label: "21.0975km" },
    { distance: "10K", time: pbs.tenK, label: "10km" },
    { distance: "5K", time: pbs.fiveK, label: "5km" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {records.map((record) => (
        <Card
          key={record.distance}
          className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background to-muted transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{record.distance}</h3>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{record.time || "-"}</div>
            <p className="mt-1 text-xs text-muted-foreground">{record.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

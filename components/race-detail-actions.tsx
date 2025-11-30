"use client"

import { EditRaceDialog } from "./edit-race-dialog"
import type { Race } from "@/lib/types"

interface RaceDetailActionsProps {
  race: Race
}

export function RaceDetailActions({ race }: RaceDetailActionsProps) {
  return (
    <div className="flex gap-2">
      <EditRaceDialog race={race} />
    </div>
  )
}

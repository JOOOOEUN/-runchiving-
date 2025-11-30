"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink, ImageIcon } from "lucide-react"
import type { Race } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"
import { AddToMyRacesButton } from "./add-to-my-races-button"
import { parseDistances, getDistanceBadgeStyle } from "@/lib/distance-utils"

interface RaceCardProps {
  race: Race
}

export function RaceCard({ race }: RaceCardProps) {
  const raceDate = new Date(race.date)
  const formattedDate = raceDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const today = new Date()
  const diffTime = raceDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let statusBadge
  if (diffDays < 0) {
    statusBadge = (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        종료
      </Badge>
    )
  } else if (diffDays === 0) {
    statusBadge = <Badge className="bg-red-500 hover:bg-red-600">D-Day</Badge>
  } else if (diffDays <= 7) {
    statusBadge = <Badge className="bg-orange-500 hover:bg-orange-600">D-{diffDays}</Badge>
  } else {
    statusBadge = <Badge className="bg-blue-500 hover:bg-blue-600">접수중</Badge>
  }

  const distances = parseDistances(race.distance)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex h-full flex-col sm:flex-row">
        <div className="relative h-48 w-full shrink-0 bg-muted sm:h-auto sm:w-32">
          {race.poster_url ? (
            <Image
              src={race.poster_url}
              alt={`${race.name} 포스터`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-orange-500/5 text-muted-foreground">
              <ImageIcon className="h-8 w-8 opacity-30" />
            </div>
          )}
          <div className="absolute left-2 top-2">{statusBadge}</div>
        </div>

        <CardContent className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-lg font-bold">{race.name}</h3>
                {distances.length > 0 && (
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {distances.map((d, idx) => (
                      <Badge key={idx} className={`text-xs ${getDistanceBadgeStyle(d)}`}>
                        {d}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">기간 {formattedDate}</p>
              <p className="text-sm text-muted-foreground">장소 {race.location}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs bg-transparent" asChild>
                <Link href={`/races/${race.id}`}>
                  <MapPin className="h-3 w-3" />
                  상세보기
                </Link>
              </Button>
              {race.registration_url && (
                <Button size="sm" className="flex-1 gap-1 text-xs" asChild>
                  <a href={race.registration_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                    신청하기
                  </a>
                </Button>
              )}
            </div>
            <AddToMyRacesButton raceId={race.id} className="w-full" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Medal, FileText, ImageIcon, Calendar, Timer } from "lucide-react"
import { RaceDetailDialog } from "./race-detail-dialog"
import { GeneratedCertificate } from "./generated-certificate"

interface RaceRecord {
  id: string
  raceName: string
  date: string
  distance: string
  raceDistances: string
  finishTime: string
  pace: string
  position: number
  medalImage: string
  certificateImage: string | null
  photos: string[]
  weather: string
  location: string
}

interface RaceArchiveCardProps {
  record: RaceRecord
  defaultTab?: "medal" | "certificate" | "photo"
}

export function RaceArchiveCard({ record, defaultTab = "medal" }: RaceArchiveCardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // defaultTab이 변경되면 activeTab도 업데이트
  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  return (
    <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold leading-tight text-foreground group-hover:text-primary">{record.raceName}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(record.date).toLocaleDateString("ko-KR")}</span>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            {record.distance}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} className="w-full" onValueChange={(v) => setActiveTab(v as "medal" | "certificate" | "photo")}>
          <div className="relative aspect-square w-full overflow-hidden bg-muted/50">
            <TabsContent value="medal" className="mt-0 h-full w-full">
              {record.medalImage ? (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <img
                    src={record.medalImage}
                    alt="Medal"
                    className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50">
                  <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <Medal className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">메달 사진을 추가해보세요</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="certificate" className="mt-0 h-full w-full">
              {record.certificateImage ? (
                <img
                  src={record.certificateImage}
                  alt="Certificate"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <GeneratedCertificate
                  raceName={record.raceName}
                  date={record.date}
                  distance={record.distance}
                  finishTime={record.finishTime}
                  pace={record.pace}
                  position={record.position}
                  location={record.location}
                />
              )}
            </TabsContent>
            <TabsContent value="photo" className="mt-0 h-full w-full">
              {record.photos.length > 0 ? (
                <img
                  src={record.photos[0]}
                  alt="Race Photo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="mb-2 h-12 w-12 opacity-20" />
                  <span className="text-sm">사진 없음</span>
                </div>
              )}
            </TabsContent>
          </div>

          <div className="border-t border-border/50 bg-muted/20 px-4 py-2">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
              <TabsTrigger
                value="medal"
                className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Medal className="mr-1 h-4 w-4" />
                <span className="text-xs">메달</span>
              </TabsTrigger>
              <TabsTrigger
                value="certificate"
                className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <FileText className="mr-1 h-4 w-4" />
                <span className="text-xs">기록증</span>
              </TabsTrigger>
              <TabsTrigger
                value="photo"
                className="h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <ImageIcon className="mr-1 h-4 w-4" />
                <span className="text-xs">사진</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/10 p-4">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="font-mono font-bold">{record.finishTime}</span>
        </div>
        <RaceDetailDialog record={record} />
      </CardFooter>
    </Card>
  )
}

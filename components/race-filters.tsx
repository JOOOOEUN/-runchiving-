"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp } from "lucide-react"

export function RaceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "asc"

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/races?${params.toString()}`)
  }

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", currentSort === "asc" ? "desc" : "asc")
    router.push(`/races?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/races")
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 정렬 토글 버튼 - 왼쪽 끝 */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSort}
        className="gap-1.5"
      >
        {currentSort === "asc" ? (
          <>
            <ArrowDown className="h-4 w-4" />
            최신순
          </>
        ) : (
          <>
            <ArrowUp className="h-4 w-4" />
            과거순
          </>
        )}
      </Button>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">거리:</label>
        <Select
          defaultValue={searchParams.get("distance") || "all"}
          onValueChange={(value) => handleFilterChange("distance", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="5K">5K</SelectItem>
            <SelectItem value="10K">10K</SelectItem>
            <SelectItem value="Half">하프</SelectItem>
            <SelectItem value="Full">풀코스</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">월:</label>
        <Select
          defaultValue={searchParams.get("month") || "all"}
          onValueChange={(value) => handleFilterChange("month", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="1">1월</SelectItem>
            <SelectItem value="2">2월</SelectItem>
            <SelectItem value="3">3월</SelectItem>
            <SelectItem value="4">4월</SelectItem>
            <SelectItem value="5">5월</SelectItem>
            <SelectItem value="6">6월</SelectItem>
            <SelectItem value="7">7월</SelectItem>
            <SelectItem value="8">8월</SelectItem>
            <SelectItem value="9">9월</SelectItem>
            <SelectItem value="10">10월</SelectItem>
            <SelectItem value="11">11월</SelectItem>
            <SelectItem value="12">12월</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(searchParams.get("distance") || searchParams.get("month")) && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          필터 초기화
        </Button>
      )}
    </div>
  )
}

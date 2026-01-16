"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDown, ArrowUp, Search, X } from "lucide-react"

export function RaceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "asc"
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/races?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim())
    } else {
      params.delete("q")
    }
    router.push(`/races?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    router.push(`/races?${params.toString()}`)
  }

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", currentSort === "asc" ? "desc" : "asc")
    router.push(`/races?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push("/races")
  }

  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="대회명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="default" size="default">
          검색
        </Button>
      </form>

      {/* 필터 옵션들 */}
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
            <SelectItem value="Full">풀코스</SelectItem>
            <SelectItem value="Half">하프</SelectItem>
            <SelectItem value="10K">10K</SelectItem>
            <SelectItem value="5K">5K</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">지역:</label>
        <Select
          defaultValue={searchParams.get("region") || "all"}
          onValueChange={(value) => handleFilterChange("region", value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="서울">서울</SelectItem>
            <SelectItem value="경기">경기</SelectItem>
            <SelectItem value="인천">인천</SelectItem>
            <SelectItem value="강원">강원</SelectItem>
            <SelectItem value="충북">충북</SelectItem>
            <SelectItem value="충남">충남</SelectItem>
            <SelectItem value="대전">대전</SelectItem>
            <SelectItem value="세종">세종</SelectItem>
            <SelectItem value="전북">전북</SelectItem>
            <SelectItem value="전남">전남</SelectItem>
            <SelectItem value="광주">광주</SelectItem>
            <SelectItem value="경북">경북</SelectItem>
            <SelectItem value="경남">경남</SelectItem>
            <SelectItem value="대구">대구</SelectItem>
            <SelectItem value="울산">울산</SelectItem>
            <SelectItem value="부산">부산</SelectItem>
            <SelectItem value="제주">제주</SelectItem>
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

        {(searchParams.get("distance") || searchParams.get("month") || searchParams.get("region") || searchParams.get("q")) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            필터 초기화
          </Button>
        )}
      </div>
    </div>
  )
}

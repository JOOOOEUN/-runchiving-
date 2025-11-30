// 거리 표기를 정규화 (풀코스 -> Full, 하프 -> Half, 10km -> 10K 등)
export function normalizeDistance(distance: string): string {
  const d = distance.toLowerCase().trim()

  // 풀코스/풀마라톤 -> Full
  if (d.includes("풀코스") || d.includes("풀마라톤") || d.includes("full") || d === "42.195" || d === "42k" || d === "42km") {
    return "Full"
  }

  // 하프/반마라톤 -> Half
  if (d.includes("하프") || d.includes("half") || d.includes("반마라톤") || d === "21k" || d === "21km" || d === "21.0975") {
    return "Half"
  }

  // 10km/10K
  if (d === "10km" || d === "10k" || d === "10" || d.includes("10km") || d.includes("10k")) {
    return "10K"
  }

  // 5km/5K
  if (d === "5km" || d === "5k" || d === "5" || d.includes("5km") || d.includes("5k")) {
    return "5K"
  }

  // 6km/6K (월드비전 글로벌 6K 등)
  if (d === "6km" || d === "6k" || d === "6" || d.includes("6km") || d.includes("6k")) {
    return "6K"
  }

  // 3km/3K
  if (d === "3km" || d === "3k" || d === "3" || d.includes("3km") || d.includes("3k")) {
    return "3K"
  }

  // 그 외는 원본 대문자로
  return distance.toUpperCase()
}

// 거리 문자열을 개별 코스로 분리 후 정규화
export function parseDistances(distance: string): string[] {
  if (!distance) return []
  // "Full, Half, 10K" 또는 "Full Half 10K" 또는 "풀코스, 하프, 10km" 형태 처리
  const parts = distance.split(/[,\s]+/).filter(d => d.trim().length > 0)
  return parts.map(normalizeDistance)
}

// 거리별 배지 색상 설정
export function getDistanceBadgeStyle(distance: string): string {
  const d = normalizeDistance(distance)

  if (d === "Full") {
    return "bg-purple-500 text-white border-purple-500"
  }
  if (d === "Half") {
    return "bg-blue-500 text-white border-blue-500"
  }
  if (d === "10K") {
    return "bg-green-500 text-white border-green-500"
  }
  if (d === "5K") {
    return "bg-amber-500 text-white border-amber-500"
  }
  if (d === "6K") {
    return "bg-teal-500 text-white border-teal-500"
  }
  if (d === "3K") {
    return "bg-pink-500 text-white border-pink-500"
  }

  return "bg-gray-500 text-white border-gray-500"
}

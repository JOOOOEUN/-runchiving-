export interface Race {
  id: string
  name: string
  date: string
  location: string
  distance: string
  course_description: string | null
  elevation_gain: number | null
  difficulty: string | null
  registration_url: string | null
  registration_deadline: string | null
  max_participants: number | null
  weather_notes: string | null
  poster_url: string | null
  created_at: string
  // 추가 필드
  entry_fee: Record<string, number> | null  // {"5K": 20000, "10K": 30000}
  organizer: string | null                   // 주최/주관
  registration_start: string | null          // 접수 시작일
  course_map_url: string | null              // 코스 지도 이미지
  medal_image_url: string | null             // 완주 메달 이미지
  tshirt_image_url: string | null            // 기념 티셔츠 이미지
  benefits: string | null                    // 참가 혜택/기념품 설명
  schedule: Record<string, string> | null    // {"06:00": "사전접수", "07:00": "출발"}
}

export interface Profile {
  id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface Registration {
  id: string
  user_id: string
  race_id: string
  bib_number: string | null
  status: "registered" | "completed" | "cancelled"
  registered_at: string
  race?: Race
}

export interface Record {
  id: string
  user_id: string
  registration_id: string | null
  race_id: string
  distance: string | null
  finish_time: string
  pace: string | null
  position: number | null
  photo_url: string | null
  medal_photo_url: string | null
  certificate_photo_url: string | null
  notes: string | null
  completed_at: string
  created_at: string
  race?: Race
}

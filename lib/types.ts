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
  finish_time: string
  pace: string | null
  position: number | null
  photo_url: string | null
  medal_photo_url: string | null
  notes: string | null
  completed_at: string
  created_at: string
  race?: Race
}

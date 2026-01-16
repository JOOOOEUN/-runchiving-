/**
 * Runchiving 더미 데이터 시드 스크립트
 * 실행: npx tsx scripts/seed-dummy-data.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경변수가 설정되지 않았습니다.")
  console.error("   NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.")
  process.exit(1)
}

// Service Role Key로 RLS 우회
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ========================================
// 더미 데이터 정의
// ========================================

const TEST_USERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "runner1@test.com",
    display_name: "러닝왕김철수",
    bio: "마라톤 3년차 | 풀코스 서브4 목표 | 주 5회 러닝",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner1",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "runner2@test.com",
    display_name: "달리는이영희",
    bio: "러닝 입문 6개월 | 10K 완주가 목표!",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner2",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "runner3@test.com",
    display_name: "산악러너박민수",
    bio: "트레일러닝 마니아 | UTMx 완주 | 산이 좋아요",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner3",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "runner4@test.com",
    display_name: "한강러너정수진",
    bio: "한강 러닝크루 소속 | 새벽 러닝 러버",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner4",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "runner5@test.com",
    display_name: "스피드스타최준호",
    bio: "전직 육상선수 | 풀코스 2:58 | 코칭도 해요",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner5",
  },
]

const RACES = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "2024 서울 마라톤",
    date: "2024-03-17",
    location: "서울 광화문",
    distance: "Full",
    course_description: "광화문 출발 → 여의도 → 잠실 → 광화문 도착. 서울의 랜드마크를 지나는 플랫한 코스.",
    elevation_gain: 50,
    difficulty: "Moderate",
    registration_url: "https://seoul-marathon.com",
    max_participants: 30000,
    weather_notes: "봄철 선선한 날씨 예상 (10-15°C)",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "2024 춘천 마라톤",
    date: "2024-10-27",
    location: "강원도 춘천시",
    distance: "Full,Half,10K",
    course_description: "의암호반을 따라 달리는 아름다운 코스. 단풍 시즌 최고의 경관.",
    elevation_gain: 120,
    difficulty: "Easy",
    max_participants: 15000,
    weather_notes: "가을 단풍 시즌, 서늘한 날씨 (8-14°C)",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "2024 부산 바다 마라톤",
    date: "2024-06-02",
    location: "부산 해운대",
    distance: "Half,10K,5K",
    course_description: "해운대 해변을 따라 달리는 시원한 코스. 바다 뷰 만끽.",
    elevation_gain: 30,
    difficulty: "Easy",
    max_participants: 10000,
    weather_notes: "초여름 해변 날씨, 습도 높음 (20-25°C)",
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "2024 제주 감귤 마라톤",
    date: "2024-11-10",
    location: "제주 서귀포시",
    distance: "Full,Half,10K",
    course_description: "감귤밭 사이를 달리는 이국적인 코스. 완주 후 감귤 무한제공!",
    elevation_gain: 200,
    difficulty: "Moderate",
    max_participants: 8000,
    weather_notes: "늦가을 제주 날씨 (15-20°C)",
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    name: "2024 대구 국제 마라톤",
    date: "2024-04-07",
    location: "대구 두류공원",
    distance: "Full,Half",
    course_description: "대구 도심을 관통하는 IAAF 인증 코스.",
    elevation_gain: 80,
    difficulty: "Moderate",
    max_participants: 20000,
    weather_notes: "봄철 따뜻한 날씨 (12-18°C)",
  },
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    name: "2025 서울 마라톤",
    date: "2025-03-16",
    location: "서울 광화문",
    distance: "Full,Half,10K",
    course_description: "대한민국 최대 규모 마라톤. IAAF Gold Label Race.",
    elevation_gain: 50,
    difficulty: "Moderate",
    max_participants: 35000,
    weather_notes: "봄철 적정 기온 예상 (8-15°C)",
  },
  {
    id: "11111111-aaaa-bbbb-cccc-dddddddddddd",
    name: "2025 경주 벚꽃 마라톤",
    date: "2025-04-05",
    location: "경주 보문호",
    distance: "Half,10K,5K",
    course_description: "보문호 주변 벚꽃길을 달리는 봄의 대표 마라톤.",
    elevation_gain: 60,
    difficulty: "Easy",
    max_participants: 12000,
    weather_notes: "벚꽃 만개 시기 (12-18°C)",
  },
]

const REGISTRATIONS = [
  // 러닝왕김철수
  { id: "reg-0001-0001-0001-000000000001", user_id: TEST_USERS[0].id, race_id: RACES[0].id, bib_number: "A-1234", status: "completed" },
  { id: "reg-0001-0001-0001-000000000002", user_id: TEST_USERS[0].id, race_id: RACES[1].id, bib_number: "B-5678", status: "completed" },
  { id: "reg-0001-0001-0001-000000000003", user_id: TEST_USERS[0].id, race_id: RACES[3].id, bib_number: "J-1001", status: "completed" },
  { id: "reg-0001-0001-0001-000000000004", user_id: TEST_USERS[0].id, race_id: RACES[5].id, bib_number: null, status: "registered" },

  // 달리는이영희
  { id: "reg-0002-0002-0002-000000000001", user_id: TEST_USERS[1].id, race_id: RACES[2].id, bib_number: "C-2001", status: "completed" },
  { id: "reg-0002-0002-0002-000000000002", user_id: TEST_USERS[1].id, race_id: RACES[6].id, bib_number: null, status: "registered" },

  // 산악러너박민수
  { id: "reg-0003-0003-0003-000000000001", user_id: TEST_USERS[2].id, race_id: RACES[1].id, bib_number: "B-3001", status: "completed" },
  { id: "reg-0003-0003-0003-000000000002", user_id: TEST_USERS[2].id, race_id: RACES[3].id, bib_number: "J-3002", status: "completed" },

  // 한강러너정수진
  { id: "reg-0004-0004-0004-000000000001", user_id: TEST_USERS[3].id, race_id: RACES[2].id, bib_number: "C-4001", status: "completed" },
  { id: "reg-0004-0004-0004-000000000002", user_id: TEST_USERS[3].id, race_id: RACES[4].id, bib_number: "D-4002", status: "completed" },
  { id: "reg-0004-0004-0004-000000000003", user_id: TEST_USERS[3].id, race_id: RACES[5].id, bib_number: null, status: "registered" },

  // 스피드스타최준호
  { id: "reg-0005-0005-0005-000000000001", user_id: TEST_USERS[4].id, race_id: RACES[0].id, bib_number: "E-0001", status: "completed" },
  { id: "reg-0005-0005-0005-000000000002", user_id: TEST_USERS[4].id, race_id: RACES[4].id, bib_number: "E-0002", status: "completed" },
  { id: "reg-0005-0005-0005-000000000003", user_id: TEST_USERS[4].id, race_id: RACES[1].id, bib_number: "E-0003", status: "completed" },
]

const RECORDS = [
  // 러닝왕김철수
  {
    id: "rec-0001-0001-0001-000000000001",
    user_id: TEST_USERS[0].id,
    registration_id: REGISTRATIONS[0].id,
    race_id: RACES[0].id,
    distance: "Full",
    finish_time: "04:12:35",
    pace: "05:59",
    position: 1523,
    photo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
    notes: "첫 풀코스 완주! 30km 지점에서 힘들었지만 끝까지 달렸다. 다음엔 서브4 도전!",
    completed_at: "2024-03-17",
  },
  {
    id: "rec-0001-0001-0001-000000000002",
    user_id: TEST_USERS[0].id,
    registration_id: REGISTRATIONS[1].id,
    race_id: RACES[1].id,
    distance: "Full",
    finish_time: "03:58:22",
    pace: "05:39",
    position: 892,
    photo_url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400",
    notes: "드디어 서브4 달성! 춘천의 단풍이 정말 아름다웠다.",
    completed_at: "2024-10-27",
  },
  {
    id: "rec-0001-0001-0001-000000000003",
    user_id: TEST_USERS[0].id,
    registration_id: REGISTRATIONS[2].id,
    race_id: RACES[3].id,
    distance: "Half",
    finish_time: "01:52:10",
    pace: "05:18",
    position: 445,
    photo_url: "https://images.unsplash.com/photo-1461896836934-28f4e2a5c3e4?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600",
    notes: "제주 감귤 마라톤 하프! 감귤밭 사이로 달리는 게 너무 좋았다.",
    completed_at: "2024-11-10",
  },

  // 달리는이영희
  {
    id: "rec-0002-0002-0002-000000000001",
    user_id: TEST_USERS[1].id,
    registration_id: REGISTRATIONS[4].id,
    race_id: RACES[2].id,
    distance: "10K",
    finish_time: "00:58:45",
    pace: "05:52",
    position: 1203,
    photo_url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400",
    notes: "첫 10K 대회 완주! 해운대 바다를 보면서 달리니까 힘든 줄 몰랐어요.",
    completed_at: "2024-06-02",
  },

  // 산악러너박민수
  {
    id: "rec-0003-0003-0003-000000000001",
    user_id: TEST_USERS[2].id,
    registration_id: REGISTRATIONS[6].id,
    race_id: RACES[1].id,
    distance: "Half",
    finish_time: "01:38:55",
    pace: "04:40",
    position: 178,
    photo_url: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600",
    notes: "춘천 하프! 의암호반 코스가 트레일 느낌이라 좋았다.",
    completed_at: "2024-10-27",
  },
  {
    id: "rec-0003-0003-0003-000000000002",
    user_id: TEST_USERS[2].id,
    registration_id: REGISTRATIONS[7].id,
    race_id: RACES[3].id,
    distance: "Full",
    finish_time: "03:28:17",
    pace: "04:56",
    position: 89,
    photo_url: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
    notes: "제주 풀코스! 업힐이 많아서 트레일 훈련이 도움됐다. 개인 최고 기록 갱신!",
    completed_at: "2024-11-10",
  },

  // 한강러너정수진
  {
    id: "rec-0004-0004-0004-000000000001",
    user_id: TEST_USERS[3].id,
    registration_id: REGISTRATIONS[8].id,
    race_id: RACES[2].id,
    distance: "5K",
    finish_time: "00:26:30",
    pace: "05:18",
    position: 567,
    photo_url: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400",
    notes: "부산 5K 첫 대회! 바다 보면서 달리니까 기분 최고였어요~",
    completed_at: "2024-06-02",
  },
  {
    id: "rec-0004-0004-0004-000000000002",
    user_id: TEST_USERS[3].id,
    registration_id: REGISTRATIONS[9].id,
    race_id: RACES[4].id,
    distance: "Half",
    finish_time: "02:05:45",
    pace: "05:56",
    position: 1876,
    photo_url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600",
    notes: "대구 하프 완주! 생각보다 힘들었지만 서브2:10 목표 달성.",
    completed_at: "2024-04-07",
  },

  // 스피드스타최준호 (엘리트)
  {
    id: "rec-0005-0005-0005-000000000001",
    user_id: TEST_USERS[4].id,
    registration_id: REGISTRATIONS[11].id,
    race_id: RACES[0].id,
    distance: "Full",
    finish_time: "02:58:33",
    pace: "04:14",
    position: 12,
    photo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
    notes: "서울 마라톤 서브3 달성! 12위로 골인. 다음 목표는 2:55.",
    completed_at: "2024-03-17",
  },
  {
    id: "rec-0005-0005-0005-000000000002",
    user_id: TEST_USERS[4].id,
    registration_id: REGISTRATIONS[12].id,
    race_id: RACES[4].id,
    distance: "Full",
    finish_time: "02:55:18",
    pace: "04:09",
    position: 8,
    photo_url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600",
    notes: "대구 마라톤 개인 최고! 2:55 벽을 깼다. IAAF 코스라 기록 공인됨.",
    completed_at: "2024-04-07",
  },
  {
    id: "rec-0005-0005-0005-000000000003",
    user_id: TEST_USERS[4].id,
    registration_id: REGISTRATIONS[13].id,
    race_id: RACES[1].id,
    distance: "Full",
    finish_time: "02:52:41",
    pace: "04:05",
    position: 5,
    photo_url: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800",
    medal_photo_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
    certificate_photo_url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600",
    notes: "춘천 마라톤 5위! 단풍 코스가 너무 아름다웠다. 시즌 베스트 2:52!",
    completed_at: "2024-10-27",
  },
]

// ========================================
// 시드 함수들
// ========================================

async function seedProfiles() {
  console.log("👤 프로필 데이터 시딩...")

  const profiles = TEST_USERS.map((u) => ({
    id: u.id,
    display_name: u.display_name,
    bio: u.bio,
    avatar_url: u.avatar_url,
  }))

  const { error } = await supabase.from("profiles").upsert(profiles, { onConflict: "id" })

  if (error) {
    console.error("❌ 프로필 시딩 실패:", error.message)
    return false
  }

  console.log(`✅ ${profiles.length}개 프로필 시딩 완료`)
  return true
}

async function seedRaces() {
  console.log("🏃 대회 데이터 시딩...")

  const { error } = await supabase.from("races").upsert(RACES, { onConflict: "id" })

  if (error) {
    console.error("❌ 대회 시딩 실패:", error.message)
    return false
  }

  console.log(`✅ ${RACES.length}개 대회 시딩 완료`)
  return true
}

async function seedRegistrations() {
  console.log("📝 신청 데이터 시딩...")

  const { error } = await supabase.from("registrations").upsert(REGISTRATIONS, { onConflict: "id" })

  if (error) {
    console.error("❌ 신청 시딩 실패:", error.message)
    return false
  }

  console.log(`✅ ${REGISTRATIONS.length}개 신청 시딩 완료`)
  return true
}

async function seedRecords() {
  console.log("🏅 기록 데이터 시딩...")

  const { error } = await supabase.from("records").upsert(RECORDS, { onConflict: "id" })

  if (error) {
    console.error("❌ 기록 시딩 실패:", error.message)
    return false
  }

  console.log(`✅ ${RECORDS.length}개 기록 시딩 완료`)
  return true
}

async function showSummary() {
  console.log("\n📊 데이터 요약:")

  const { data: profiles } = await supabase.from("profiles").select("id")
  const { data: races } = await supabase.from("races").select("id")
  const { data: registrations } = await supabase.from("registrations").select("id")
  const { data: records } = await supabase.from("records").select("id")

  console.log(`   - Profiles: ${profiles?.length || 0}개`)
  console.log(`   - Races: ${races?.length || 0}개`)
  console.log(`   - Registrations: ${registrations?.length || 0}개`)
  console.log(`   - Records: ${records?.length || 0}개`)
}

// ========================================
// 메인 실행
// ========================================

async function main() {
  console.log("🌱 Runchiving 더미 데이터 시딩 시작...\n")

  // 순서대로 시딩 (FK 의존성 때문)
  const profilesOk = await seedProfiles()
  if (!profilesOk) {
    console.log("\n⚠️  프로필 시딩에 실패했습니다. FK 제약으로 인해 auth.users가 필요할 수 있습니다.")
    console.log("   SQL 스크립트(003_seed_dummy_data.sql)를 Supabase SQL Editor에서 실행해주세요.")
    return
  }

  const racesOk = await seedRaces()
  if (!racesOk) return

  const registrationsOk = await seedRegistrations()
  if (!registrationsOk) return

  const recordsOk = await seedRecords()
  if (!recordsOk) return

  await showSummary()

  console.log("\n🎉 더미 데이터 시딩 완료!")
  console.log("\n테스트 계정:")
  TEST_USERS.forEach((u) => {
    console.log(`   - ${u.display_name} (${u.email})`)
  })
}

main().catch(console.error)

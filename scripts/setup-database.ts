/**
 * Supabase 데이터베이스 설정 스크립트
 * 테이블 생성 + 더미 데이터 시딩
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경변수가 설정되지 않았습니다.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ========================================
// 테이블 생성 (RPC 사용)
// ========================================

async function createTables() {
  console.log("📦 테이블 생성 중...")

  // races 테이블 생성
  const { error: racesError } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS races (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        date DATE NOT NULL,
        location TEXT NOT NULL,
        distance TEXT NOT NULL,
        course_description TEXT,
        elevation_gain INTEGER,
        difficulty TEXT,
        registration_url TEXT,
        registration_deadline DATE,
        max_participants INTEGER,
        weather_notes TEXT,
        poster_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  })

  if (racesError) {
    console.log("⚠️  RPC exec_sql not available, trying direct approach...")
    return false
  }

  return true
}

// ========================================
// 더미 데이터 (직접 insert)
// ========================================

const RACES = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "2024 서울 마라톤",
    date: "2024-03-17",
    location: "서울 광화문",
    distance: "Full",
    course_description: "광화문 출발 → 여의도 → 잠실 → 광화문 도착",
    elevation_gain: 50,
    difficulty: "Moderate",
    max_participants: 30000,
    weather_notes: "봄철 선선한 날씨 예상 (10-15°C)",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "2024 춘천 마라톤",
    date: "2024-10-27",
    location: "강원도 춘천시",
    distance: "Full,Half,10K",
    course_description: "의암호반을 따라 달리는 아름다운 코스",
    elevation_gain: 120,
    difficulty: "Easy",
    max_participants: 15000,
    weather_notes: "가을 단풍 시즌 (8-14°C)",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "2024 부산 바다 마라톤",
    date: "2024-06-02",
    location: "부산 해운대",
    distance: "Half,10K,5K",
    course_description: "해운대 해변을 따라 달리는 시원한 코스",
    elevation_gain: 30,
    difficulty: "Easy",
    max_participants: 10000,
    weather_notes: "초여름 해변 날씨 (20-25°C)",
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "2024 제주 감귤 마라톤",
    date: "2024-11-10",
    location: "제주 서귀포시",
    distance: "Full,Half,10K",
    course_description: "감귤밭 사이를 달리는 이국적인 코스",
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
    course_description: "대구 도심을 관통하는 IAAF 인증 코스",
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
    course_description: "보문호 주변 벚꽃길을 달리는 봄의 대표 마라톤",
    elevation_gain: 60,
    difficulty: "Easy",
    max_participants: 12000,
    weather_notes: "벚꽃 만개 시기 (12-18°C)",
  },
]

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

async function checkTables() {
  console.log("🔍 테이블 존재 여부 확인...")

  // races 테이블 확인
  const { data: races, error: racesError } = await supabase.from("races").select("id").limit(1)

  if (racesError && racesError.message.includes("does not exist")) {
    console.log("❌ races 테이블이 없습니다.")
    return { races: false, profiles: false }
  }

  // profiles 테이블 확인
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id").limit(1)

  const hasProfiles = !profilesError || !profilesError.message.includes("does not exist")

  console.log(`   - races: ${!racesError ? "✅" : "❌"}`)
  console.log(`   - profiles: ${hasProfiles ? "✅" : "❌"}`)

  return {
    races: !racesError,
    profiles: hasProfiles,
  }
}

async function main() {
  console.log("🚀 데이터베이스 설정 시작...\n")

  const tables = await checkTables()

  if (!tables.races) {
    console.log("\n⚠️  테이블이 없습니다!")
    console.log("   Supabase SQL Editor에서 아래 파일을 실행해주세요:")
    console.log("   📄 scripts/001_create_tables.sql")
    console.log("\n   그 후 다시 이 스크립트를 실행하세요.")
    return
  }

  // races 테이블이 있으면 데이터 시딩
  console.log("\n")
  await seedRaces()

  if (tables.profiles) {
    // profiles 테이블도 있으면 전체 시딩
    console.log("\n프로필 및 기록 데이터는 003_seed_dummy_data.sql을 SQL Editor에서 실행해주세요.")
  }

  // 최종 카운트
  const { count: raceCount } = await supabase.from("races").select("*", { count: "exact", head: true })
  console.log(`\n📊 현재 races 테이블: ${raceCount}개 대회`)
}

main().catch(console.error)

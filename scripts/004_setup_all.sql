-- ========================================
-- Runchiving 전체 설정 (테이블 + 더미 데이터)
-- 개발/테스트 환경용 - SQL Editor에서 한 번에 실행
-- ========================================

-- ----------------------------------------
-- 1. 테이블 생성
-- ----------------------------------------

-- races 테이블
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

-- profiles 테이블 (개발용 - auth.users FK 없이)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- registrations 테이블
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  bib_number TEXT,
  status TEXT NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- records 테이블
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  distance TEXT,
  finish_time TEXT NOT NULL,
  pace TEXT,
  position INTEGER,
  photo_url TEXT,
  medal_photo_url TEXT,
  certificate_photo_url TEXT,
  notes TEXT,
  completed_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------
-- 2. RLS 설정
-- ----------------------------------------
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "races_select_all" ON races;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "registrations_select_own" ON registrations;
DROP POLICY IF EXISTS "registrations_insert_own" ON registrations;
DROP POLICY IF EXISTS "registrations_update_own" ON registrations;
DROP POLICY IF EXISTS "registrations_delete_own" ON registrations;
DROP POLICY IF EXISTS "records_select_own" ON records;
DROP POLICY IF EXISTS "records_insert_own" ON records;
DROP POLICY IF EXISTS "records_update_own" ON records;
DROP POLICY IF EXISTS "records_delete_own" ON records;

-- 새 정책 생성
CREATE POLICY "races_select_all" ON races FOR SELECT USING (true);
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "registrations_select_own" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "registrations_insert_own" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "registrations_update_own" ON registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "registrations_delete_own" ON registrations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "records_select_own" ON records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "records_insert_own" ON records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "records_update_own" ON records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "records_delete_own" ON records FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------
-- 3. 프로필 자동 생성 트리거
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', SPLIT_PART(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------
-- 4. Storage 버킷 생성 (이미지 업로드용)
-- ----------------------------------------
-- medals 버킷 (메달 사진)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medals', 'medals', true)
ON CONFLICT (id) DO NOTHING;

-- certificates 버킷 (완주증)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- public 버킷 (일반 이미지)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책 (모든 버킷 공통)
DROP POLICY IF EXISTS "storage_select_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_auth" ON storage.objects;

-- 모든 버킷에서 읽기 허용
CREATE POLICY "storage_select_all" ON storage.objects
  FOR SELECT USING (true);

-- 인증된 사용자만 업로드 허용
CREATE POLICY "storage_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 수정 허용
CREATE POLICY "storage_update_auth" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 허용
CREATE POLICY "storage_delete_auth" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- 5. 더미 대회 데이터
-- ----------------------------------------
INSERT INTO races (id, name, date, location, distance, course_description, elevation_gain, difficulty, max_participants, weather_notes)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024 서울 마라톤', '2024-03-17', '서울 광화문', 'Full', '광화문 출발 → 여의도 → 잠실 → 광화문 도착', 50, 'Moderate', 30000, '봄철 선선한 날씨 (10-15°C)'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024 춘천 마라톤', '2024-10-27', '강원도 춘천시', 'Full,Half,10K', '의암호반을 따라 달리는 아름다운 코스', 120, 'Easy', 15000, '가을 단풍 시즌 (8-14°C)'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '2024 부산 바다 마라톤', '2024-06-02', '부산 해운대', 'Half,10K,5K', '해운대 해변을 따라 달리는 시원한 코스', 30, 'Easy', 10000, '초여름 해변 날씨 (20-25°C)'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '2024 제주 감귤 마라톤', '2024-11-10', '제주 서귀포시', 'Full,Half,10K', '감귤밭 사이를 달리는 이국적인 코스', 200, 'Moderate', 8000, '늦가을 제주 날씨 (15-20°C)'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024 대구 국제 마라톤', '2024-04-07', '대구 두류공원', 'Full,Half', '대구 도심을 관통하는 IAAF 인증 코스', 80, 'Moderate', 20000, '봄철 따뜻한 날씨 (12-18°C)'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '2025 서울 마라톤', '2025-03-16', '서울 광화문', 'Full,Half,10K', '대한민국 최대 규모 마라톤', 50, 'Moderate', 35000, '봄철 적정 기온 (8-15°C)'),
  ('11111111-aaaa-bbbb-cccc-dddddddddddd', '2025 경주 벚꽃 마라톤', '2025-04-05', '경주 보문호', 'Half,10K,5K', '보문호 주변 벚꽃길을 달리는 봄의 대표 마라톤', 60, 'Easy', 12000, '벚꽃 만개 시기 (12-18°C)')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ----------------------------------------
-- 6. 더미 사용자 프로필 (테스트용)
-- ----------------------------------------
INSERT INTO profiles (id, display_name, bio, avatar_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', '러닝왕김철수', '마라톤 3년차 | 풀코스 서브4 목표', 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner1'),
  ('22222222-2222-2222-2222-222222222222', '달리는이영희', '러닝 입문 6개월 | 10K 완주가 목표!', 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner2'),
  ('33333333-3333-3333-3333-333333333333', '산악러너박민수', '트레일러닝 마니아 | 산이 좋아요', 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner3'),
  ('44444444-4444-4444-4444-444444444444', '한강러너정수진', '한강 러닝크루 소속', 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner4'),
  ('55555555-5555-5555-5555-555555555555', '스피드스타최준호', '전직 육상선수 | 풀코스 2:58', 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner5')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- ----------------------------------------
-- 7. 더미 신청 데이터
-- ----------------------------------------
INSERT INTO registrations (id, user_id, race_id, bib_number, status)
VALUES
  ('11110001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'A-1234', 'completed'),
  ('11110001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B-5678', 'completed'),
  ('11110001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'J-1001', 'completed'),
  ('22220002-0002-0002-0002-000000000001', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'C-2001', 'completed'),
  ('33330003-0003-0003-0003-000000000001', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B-3001', 'completed'),
  ('33330003-0003-0003-0003-000000000002', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'J-3002', 'completed'),
  ('44440004-0004-0004-0004-000000000001', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'C-4001', 'completed'),
  ('44440004-0004-0004-0004-000000000002', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'D-4002', 'completed'),
  ('55550005-0005-0005-0005-000000000001', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'E-0001', 'completed'),
  ('55550005-0005-0005-0005-000000000002', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'E-0002', 'completed'),
  ('55550005-0005-0005-0005-000000000003', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'E-0003', 'completed')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------
-- 8. 더미 기록 데이터
-- ----------------------------------------
INSERT INTO records (id, user_id, registration_id, race_id, distance, finish_time, pace, position, photo_url, medal_photo_url, certificate_photo_url, notes, completed_at)
VALUES
  -- 러닝왕김철수
  ('a0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '11110001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Full', '04:12:35', '05:59', 1523, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', '첫 풀코스 완주! 30km 지점에서 힘들었지만 끝까지 달렸다.', '2024-03-17'),
  ('a0000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', '11110001-0001-0001-0001-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Full', '03:58:22', '05:39', 892, 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800', 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400', NULL, '드디어 서브4 달성! 춘천의 단풍이 정말 아름다웠다.', '2024-10-27'),
  ('a0000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', '11110001-0001-0001-0001-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Half', '01:52:10', '05:18', 445, 'https://images.unsplash.com/photo-1461896836934-28f4e2a5c3e4?w=800', 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', '제주 감귤 마라톤 하프! 감귤밭 사이로 달리는 게 너무 좋았다.', '2024-11-10'),

  -- 달리는이영희
  ('a0000002-0002-0002-0002-000000000001', '22222222-2222-2222-2222-222222222222', '22220002-0002-0002-0002-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '10K', '00:58:45', '05:52', 1203, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400', NULL, '첫 10K 대회 완주! 해운대 바다를 보면서 달리니까 힘든 줄 몰랐어요.', '2024-06-02'),

  -- 산악러너박민수
  ('a0000003-0003-0003-0003-000000000001', '33333333-3333-3333-3333-333333333333', '33330003-0003-0003-0003-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Half', '01:38:55', '04:40', 178, 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', '춘천 하프! 의암호반 코스가 트레일 느낌이라 좋았다.', '2024-10-27'),
  ('a0000003-0003-0003-0003-000000000002', '33333333-3333-3333-3333-333333333333', '33330003-0003-0003-0003-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Full', '03:28:17', '04:56', 89, 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800', 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', '제주 풀코스! 업힐이 많아서 트레일 훈련이 도움됐다.', '2024-11-10'),

  -- 한강러너정수진
  ('a0000004-0004-0004-0004-000000000001', '44444444-4444-4444-4444-444444444444', '44440004-0004-0004-0004-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '5K', '00:26:30', '05:18', 567, 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400', NULL, '부산 5K 첫 대회! 바다 보면서 달리니까 기분 최고였어요~', '2024-06-02'),
  ('a0000004-0004-0004-0004-000000000002', '44444444-4444-4444-4444-444444444444', '44440004-0004-0004-0004-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Half', '02:05:45', '05:56', 1876, 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', '대구 하프 완주! 생각보다 힘들었지만 서브2:10 목표 달성.', '2024-04-07'),

  -- 스피드스타최준호 (엘리트)
  ('a0000005-0005-0005-0005-000000000001', '55555555-5555-5555-5555-555555555555', '55550005-0005-0005-0005-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Full', '02:58:33', '04:14', 12, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800', 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', '서울 마라톤 서브3 달성! 12위로 골인.', '2024-03-17'),
  ('a0000005-0005-0005-0005-000000000002', '55555555-5555-5555-5555-555555555555', '55550005-0005-0005-0005-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Full', '02:55:18', '04:09', 8, 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800', 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', '대구 마라톤 개인 최고! 2:55 벽을 깼다.', '2024-04-07'),
  ('a0000005-0005-0005-0005-000000000003', '55555555-5555-5555-5555-555555555555', '55550005-0005-0005-0005-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Full', '02:52:41', '04:05', 5, 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', '춘천 마라톤 5위! 시즌 베스트 2:52!', '2024-10-27')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------
-- 9. 결과 확인
-- ----------------------------------------
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL SELECT 'races', COUNT(*) FROM races
UNION ALL SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL SELECT 'records', COUNT(*) FROM records;

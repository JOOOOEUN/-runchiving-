-- ========================================
-- Runchiving 더미 데이터 시드 스크립트
-- 테스트 및 개발 환경용
-- ========================================
-- 실행 방법: Supabase SQL Editor에서 Service Role로 실행
-- 주의: 이 스크립트는 RLS를 우회하므로 개발 환경에서만 사용하세요

-- ----------------------------------------
-- 0. 기존 더미 데이터 정리 (선택사항)
-- ----------------------------------------
-- DELETE FROM records WHERE user_id IN (SELECT id FROM profiles WHERE display_name LIKE 'Test%');
-- DELETE FROM registrations WHERE user_id IN (SELECT id FROM profiles WHERE display_name LIKE 'Test%');
-- DELETE FROM profiles WHERE display_name LIKE 'Test%';

-- ----------------------------------------
-- 1. 테스트용 Auth Users 생성 (Supabase Admin)
-- ----------------------------------------
-- 참고: auth.users 테이블에 직접 삽입은 권장되지 않음
-- 대신 Supabase Dashboard > Authentication > Users에서 생성하거나
-- supabase.auth.admin.createUser() API 사용 권장

-- 개발/테스트를 위해 임시로 FK 제약 비활성화
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE registrations DISABLE TRIGGER ALL;
ALTER TABLE records DISABLE TRIGGER ALL;

-- ----------------------------------------
-- 2. 테스트 사용자 프로필 (5명)
-- ----------------------------------------
INSERT INTO profiles (id, display_name, bio, avatar_url, created_at)
VALUES
  -- 테스트 사용자 1: 열정적인 마라토너
  (
    '11111111-1111-1111-1111-111111111111',
    '러닝왕김철수',
    '마라톤 3년차 | 풀코스 서브4 목표 | 주 5회 러닝',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=runner1',
    NOW() - INTERVAL '1 year'
  ),
  -- 테스트 사용자 2: 초보 러너
  (
    '22222222-2222-2222-2222-222222222222',
    '달리는이영희',
    '러닝 입문 6개월 | 10K 완주가 목표!',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=runner2',
    NOW() - INTERVAL '6 months'
  ),
  -- 테스트 사용자 3: 트레일 러너
  (
    '33333333-3333-3333-3333-333333333333',
    '산악러너박민수',
    '트레일러닝 마니아 | UTMx 완주 | 산이 좋아요',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=runner3',
    NOW() - INTERVAL '2 years'
  ),
  -- 테스트 사용자 4: 동호회 회원
  (
    '44444444-4444-4444-4444-444444444444',
    '한강러너정수진',
    '한강 러닝크루 소속 | 새벽 러닝 러버',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=runner4',
    NOW() - INTERVAL '8 months'
  ),
  -- 테스트 사용자 5: 엘리트 러너
  (
    '55555555-5555-5555-5555-555555555555',
    '스피드스타최준호',
    '전직 육상선수 | 풀코스 2:58 | 코칭도 해요',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=runner5',
    NOW() - INTERVAL '5 years'
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url;

-- ----------------------------------------
-- 3. 샘플 대회 데이터 (기존 + 추가)
-- ----------------------------------------
INSERT INTO races (id, name, date, location, distance, course_description, elevation_gain, difficulty, registration_url, registration_deadline, max_participants, weather_notes, poster_url, created_at)
VALUES
  -- 과거 대회 (기록용)
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024 서울 마라톤',
    '2024-03-17',
    '서울 광화문',
    'Full',
    '광화문 출발 → 여의도 → 잠실 → 광화문 도착. 서울의 랜드마크를 지나는 플랫한 코스.',
    50,
    'Moderate',
    'https://seoul-marathon.com',
    '2024-02-28',
    30000,
    '봄철 선선한 날씨 예상 (10-15°C)',
    NULL,
    '2024-01-01'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2024 춘천 마라톤',
    '2024-10-27',
    '강원도 춘천시',
    'Full,Half,10K',
    '의암호반을 따라 달리는 아름다운 코스. 단풍 시즌 최고의 경관.',
    120,
    'Easy',
    'https://chuncheon-marathon.com',
    '2024-10-10',
    15000,
    '가을 단풍 시즌, 서늘한 날씨 (8-14°C)',
    NULL,
    '2024-07-01'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2024 부산 바다 마라톤',
    '2024-06-02',
    '부산 해운대',
    'Half,10K,5K',
    '해운대 해변을 따라 달리는 시원한 코스. 바다 뷰 만끽.',
    30,
    'Easy',
    'https://busan-sea-marathon.com',
    '2024-05-20',
    10000,
    '초여름 해변 날씨, 습도 높음 (20-25°C)',
    NULL,
    '2024-03-01'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '2024 제주 감귤 마라톤',
    '2024-11-10',
    '제주 서귀포시',
    'Full,Half,10K',
    '감귤밭 사이를 달리는 이국적인 코스. 완주 후 감귤 무한제공!',
    200,
    'Moderate',
    'https://jeju-citrus-marathon.com',
    '2024-10-25',
    8000,
    '늦가을 제주 날씨 (15-20°C)',
    NULL,
    '2024-08-01'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '2024 대구 국제 마라톤',
    '2024-04-07',
    '대구 두류공원',
    'Full,Half',
    '대구 도심을 관통하는 IAAF 인증 코스.',
    80,
    'Moderate',
    'https://daegu-marathon.com',
    '2024-03-20',
    20000,
    '봄철 따뜻한 날씨 (12-18°C)',
    NULL,
    '2024-01-15'
  ),
  -- 미래/예정 대회
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '2025 서울 마라톤',
    '2025-03-16',
    '서울 광화문',
    'Full,Half,10K',
    '대한민국 최대 규모 마라톤. IAAF Gold Label Race.',
    50,
    'Moderate',
    'https://seoul-marathon.com/2025',
    '2025-02-28',
    35000,
    '봄철 적정 기온 예상 (8-15°C)',
    NULL,
    NOW()
  ),
  (
    '11111111-aaaa-bbbb-cccc-dddddddddddd',
    '2025 경주 벚꽃 마라톤',
    '2025-04-05',
    '경주 보문호',
    'Half,10K,5K',
    '보문호 주변 벚꽃길을 달리는 봄의 대표 마라톤.',
    60,
    'Easy',
    'https://gyeongju-cherry-marathon.com',
    '2025-03-20',
    12000,
    '벚꽃 만개 시기 (12-18°C)',
    NULL,
    NOW()
  ),
  (
    '22222222-aaaa-bbbb-cccc-dddddddddddd',
    '2025 DMZ 평화 마라톤',
    '2025-06-25',
    '파주 임진각',
    'Half,10K',
    'DMZ 평화누리길을 달리는 의미있는 코스.',
    100,
    'Moderate',
    'https://dmz-peace-marathon.com',
    '2025-06-10',
    5000,
    '초여름 (20-26°C)',
    NULL,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  date = EXCLUDED.date,
  location = EXCLUDED.location,
  distance = EXCLUDED.distance;

-- ----------------------------------------
-- 4. 대회 신청 더미 데이터 (Registrations)
-- ----------------------------------------
INSERT INTO registrations (id, user_id, race_id, bib_number, status, registered_at)
VALUES
  -- 러닝왕김철수: 다수 대회 참가
  (
    'reg-0001-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'A-1234',
    'completed',
    '2024-02-15'
  ),
  (
    'reg-0001-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'B-5678',
    'completed',
    '2024-09-01'
  ),
  (
    'reg-0001-0001-0001-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'J-1001',
    'completed',
    '2024-10-01'
  ),
  (
    'reg-0001-0001-0001-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    NULL,
    'registered',
    NOW()
  ),

  -- 달리는이영희: 10K 위주 참가
  (
    'reg-0002-0002-0002-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'C-2001',
    'completed',
    '2024-05-01'
  ),
  (
    'reg-0002-0002-0002-000000000002',
    '22222222-2222-2222-2222-222222222222',
    '11111111-aaaa-bbbb-cccc-dddddddddddd',
    NULL,
    'registered',
    NOW()
  ),

  -- 산악러너박민수: 다양한 대회
  (
    'reg-0003-0003-0003-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'B-3001',
    'completed',
    '2024-08-15'
  ),
  (
    'reg-0003-0003-0003-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'J-3002',
    'completed',
    '2024-09-20'
  ),
  (
    'reg-0003-0003-0003-000000000003',
    '33333333-3333-3333-3333-333333333333',
    '22222222-aaaa-bbbb-cccc-dddddddddddd',
    NULL,
    'registered',
    NOW()
  ),

  -- 한강러너정수진
  (
    'reg-0004-0004-0004-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'C-4001',
    'completed',
    '2024-04-20'
  ),
  (
    'reg-0004-0004-0004-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'D-4002',
    'completed',
    '2024-03-01'
  ),
  (
    'reg-0004-0004-0004-000000000003',
    '44444444-4444-4444-4444-444444444444',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    NULL,
    'registered',
    NOW()
  ),

  -- 스피드스타최준호: 엘리트 러너
  (
    'reg-0005-0005-0005-000000000001',
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'E-0001',
    'completed',
    '2024-01-20'
  ),
  (
    'reg-0005-0005-0005-000000000002',
    '55555555-5555-5555-5555-555555555555',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'E-0002',
    'completed',
    '2024-02-10'
  ),
  (
    'reg-0005-0005-0005-000000000003',
    '55555555-5555-5555-5555-555555555555',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'E-0003',
    'completed',
    '2024-09-05'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------
-- 5. 완주 기록 더미 데이터 (Records)
-- ----------------------------------------
INSERT INTO records (id, user_id, registration_id, race_id, distance, finish_time, pace, position, photo_url, medal_photo_url, certificate_photo_url, notes, completed_at, created_at)
VALUES
  -- 러닝왕김철수의 기록들
  (
    'rec-0001-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'reg-0001-0001-0001-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Full',
    '04:12:35',
    '05:59',
    1523,
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
    '첫 풀코스 완주! 30km 지점에서 힘들었지만 끝까지 달렸다. 다음엔 서브4 도전!',
    '2024-03-17',
    '2024-03-17'
  ),
  (
    'rec-0001-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'reg-0001-0001-0001-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Full',
    '03:58:22',
    '05:39',
    892,
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400',
    NULL,
    '드디어 서브4 달성! 춘천의 단풍이 정말 아름다웠다. 페이스 조절이 잘 됐다.',
    '2024-10-27',
    '2024-10-27'
  ),
  (
    'rec-0001-0001-0001-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'reg-0001-0001-0001-000000000003',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Half',
    '01:52:10',
    '05:18',
    445,
    'https://images.unsplash.com/photo-1461896836934- voices0?w=800',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
    '제주 감귤 마라톤 하프! 감귤밭 사이로 달리는 게 너무 좋았다. 완주 후 감귤 실컷 먹음 ㅎㅎ',
    '2024-11-10',
    '2024-11-10'
  ),

  -- 달리는이영희의 기록
  (
    'rec-0002-0002-0002-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'reg-0002-0002-0002-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '10K',
    '00:58:45',
    '05:52',
    1203,
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400',
    NULL,
    '첫 10K 대회 완주! 해운대 바다를 보면서 달리니까 힘든 줄 몰랐어요. 다음엔 하프 도전!',
    '2024-06-02',
    '2024-06-02'
  ),

  -- 산악러너박민수의 기록들
  (
    'rec-0003-0003-0003-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'reg-0003-0003-0003-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Half',
    '01:38:55',
    '04:40',
    178,
    'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
    '춘천 하프! 의암호반 코스가 트레일 느낌이라 좋았다. 서브1:40 근접!',
    '2024-10-27',
    '2024-10-27'
  ),
  (
    'rec-0003-0003-0003-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'reg-0003-0003-0003-000000000002',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Full',
    '03:28:17',
    '04:56',
    89,
    'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
    'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
    '제주 풀코스! 업힐이 많아서 트레일 훈련이 도움됐다. 개인 최고 기록 갱신!',
    '2024-11-10',
    '2024-11-10'
  ),

  -- 한강러너정수진의 기록들
  (
    'rec-0004-0004-0004-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'reg-0004-0004-0004-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '5K',
    '00:26:30',
    '05:18',
    567,
    'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400',
    NULL,
    '부산 5K 첫 대회! 바다 보면서 달리니까 기분 최고였어요~',
    '2024-06-02',
    '2024-06-02'
  ),
  (
    'rec-0004-0004-0004-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'reg-0004-0004-0004-000000000002',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Half',
    '02:05:45',
    '05:56',
    1876,
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=400',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
    '대구 하프 완주! 생각보다 힘들었지만 서브2:10 목표 달성. 한강 러닝크루 화이팅!',
    '2024-04-07',
    '2024-04-07'
  ),

  -- 스피드스타최준호의 기록들 (엘리트)
  (
    'rec-0005-0005-0005-000000000001',
    '55555555-5555-5555-5555-555555555555',
    'reg-0005-0005-0005-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Full',
    '02:58:33',
    '04:14',
    12,
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
    '서울 마라톤 서브3 달성! 12위로 골인. 다음 목표는 2:55.',
    '2024-03-17',
    '2024-03-17'
  ),
  (
    'rec-0005-0005-0005-000000000002',
    '55555555-5555-5555-5555-555555555555',
    'reg-0005-0005-0005-000000000002',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Full',
    '02:55:18',
    '04:09',
    8,
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
    '대구 마라톤 개인 최고! 2:55 벽을 깼다. IAAF 코스라 기록 공인됨.',
    '2024-04-07',
    '2024-04-07'
  ),
  (
    'rec-0005-0005-0005-000000000003',
    '55555555-5555-5555-5555-555555555555',
    'reg-0005-0005-0005-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Full',
    '02:52:41',
    '04:05',
    5,
    'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
    '춘천 마라톤 5위! 단풍 코스가 너무 아름다웠다. 시즌 베스트 2:52!',
    '2024-10-27',
    '2024-10-27'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------
-- 6. 트리거 다시 활성화
-- ----------------------------------------
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE registrations ENABLE TRIGGER ALL;
ALTER TABLE records ENABLE TRIGGER ALL;

-- ----------------------------------------
-- 7. 데이터 확인
-- ----------------------------------------
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Races', COUNT(*) FROM races
UNION ALL
SELECT 'Registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'Records', COUNT(*) FROM records;

-- 사용자별 기록 요약
SELECT
  p.display_name,
  COUNT(DISTINCT reg.id) as total_registrations,
  COUNT(DISTINCT rec.id) as total_records,
  MIN(rec.finish_time) as best_time
FROM profiles p
LEFT JOIN registrations reg ON p.id = reg.user_id
LEFT JOIN records rec ON p.id = rec.user_id
WHERE p.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
GROUP BY p.id, p.display_name
ORDER BY total_records DESC;

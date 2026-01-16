-- ----------------------------------------
-- 대회 시리즈 기능 추가
-- ----------------------------------------

-- 1. race_series 테이블 생성
CREATE TABLE IF NOT EXISTS race_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                -- "서울하프마라톤"
  short_name TEXT,                   -- "서하마"
  description TEXT,                  -- 시리즈 설명
  official_url TEXT,                 -- 공식 홈페이지
  logo_url TEXT,                     -- 시리즈 로고
  typical_month INTEGER,             -- 보통 개최 월 (3 = 3월)
  typical_distances TEXT,            -- "Half, 10K, 5K"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. races 테이블에 series_id 컬럼 추가
ALTER TABLE races ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES race_series(id);

-- 3. RLS 활성화 및 정책 설정
ALTER TABLE race_series ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용
CREATE POLICY "race_series_select_all" ON race_series FOR SELECT USING (true);

-- 4. 초기 시리즈 데이터 삽입
INSERT INTO race_series (id, name, short_name, description, official_url, typical_month, typical_distances) VALUES
  ('11111111-0000-0000-0000-000000000001', '서울하프마라톤', '서하마', '매년 3월 여의도에서 개최되는 대한민국 대표 하프마라톤', 'https://www.seoulhalfmarathon.com', 3, 'Half, 10K, 5K'),
  ('11111111-0000-0000-0000-000000000002', '춘천마라톤', '춘마', '의암호반을 따라 달리는 아름다운 가을 마라톤', 'https://www.chuncheonmarathon.com', 10, 'Full, Half, 10K'),
  ('11111111-0000-0000-0000-000000000003', '제주국제마라톤', '제마', '제주의 아름다운 자연 속에서 달리는 국제 마라톤', 'https://www.jejumarathon.com', 6, 'Full, Half, 10K'),
  ('11111111-0000-0000-0000-000000000004', '서울마라톤', NULL, '광화문에서 출발하는 대한민국 최대 규모 풀코스 마라톤', 'https://www.seoul-marathon.com', 3, 'Full'),
  ('11111111-0000-0000-0000-000000000005', '대구국제마라톤', NULL, '매년 4월 대구에서 개최되는 국제 마라톤', NULL, 4, 'Full, Half, 10K'),
  ('11111111-0000-0000-0000-000000000006', '경주벚꽃마라톤', NULL, '벚꽃 시즌에 경주에서 개최되는 봄 마라톤', NULL, 4, 'Full, Half, 10K, 5K'),
  ('11111111-0000-0000-0000-000000000007', '부산바다마라톤', NULL, '해운대 해변을 따라 달리는 시원한 여름 마라톤', NULL, 6, 'Half, 10K, 5K')
ON CONFLICT (id) DO NOTHING;

-- 5. 기존 대회 데이터에 시리즈 연결 (예시)
-- 서울 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000004'
WHERE name ILIKE '%서울 마라톤%' OR name ILIKE '%서울마라톤%';

-- 춘천 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000002'
WHERE name ILIKE '%춘천%마라톤%' OR name ILIKE '%춘천마라톤%';

-- 제주 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000003'
WHERE name ILIKE '%제주%마라톤%' OR name ILIKE '%제주마라톤%';

-- 대구 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000005'
WHERE name ILIKE '%대구%마라톤%' OR name ILIKE '%대구마라톤%';

-- 경주 벚꽃 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000006'
WHERE name ILIKE '%경주%벚꽃%' OR name ILIKE '%경주벚꽃%';

-- 부산 바다 마라톤 시리즈
UPDATE races SET series_id = '11111111-0000-0000-0000-000000000007'
WHERE name ILIKE '%부산%바다%' OR name ILIKE '%부산바다%';

-- 6. 결과 확인
SELECT 'race_series' as table_name, COUNT(*) as count FROM race_series
UNION ALL SELECT 'races with series', COUNT(*) FROM races WHERE series_id IS NOT NULL;
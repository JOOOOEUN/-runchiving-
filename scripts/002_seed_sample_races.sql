-- Insert sample marathon races
INSERT INTO races (name, date, location, distance, course_description, elevation_gain, difficulty, registration_url, registration_deadline, max_participants, weather_notes)
VALUES
  ('서울 마라톤', '2025-03-15', '서울 잠실종합운동장', 'Full', '한강을 따라 달리는 평탄한 코스. 봄 날씨와 벚꽃을 즐길 수 있는 코스입니다.', 120, 'Easy', 'https://example.com/seoul-marathon', '2025-03-01', 30000, '3월 평균기온 8-15도, 맑은 날씨 예상'),
  ('춘천 마라톤', '2025-10-20', '춘천 의암호', 'Full', '의암호 주변을 도는 아름다운 호수 코스. 가을 단풍이 장관입니다.', 180, 'Moderate', 'https://example.com/chuncheon-marathon', '2025-10-05', 15000, '10월 평균기온 10-18도, 청명한 가을 날씨'),
  ('부산 국제 마라톤', '2025-05-11', '부산 광안리해수욕장', 'Full', '해운대와 광안리를 연결하는 해안 코스. 바다 풍경이 아름답습니다.', 95, 'Easy', 'https://example.com/busan-marathon', '2025-04-25', 25000, '5월 평균기온 15-22도, 온화한 날씨'),
  ('제주 마라톤', '2025-11-03', '제주 서귀포', 'Full', '해안도로를 따라 달리는 환상적인 코스. 제주의 아름다운 자연을 만끽할 수 있습니다.', 250, 'Hard', 'https://example.com/jeju-marathon', '2025-10-18', 10000, '11월 평균기온 12-17도, 바람 주의'),
  ('대구 마라톤', '2025-04-06', '대구 두류공원', 'Half', '도심과 공원을 오가는 하프 코스. 초보자에게 추천합니다.', 60, 'Easy', 'https://example.com/daegu-marathon', '2025-03-22', 12000, '4월 평균기온 10-20도, 쾌적한 봄 날씨'),
  ('강릉 하프 마라톤', '2025-06-14', '강릉 경포대', 'Half', '경포호수 주변 하프 코스. 평탄하고 달리기 좋은 코스입니다.', 40, 'Easy', 'https://example.com/gangneung-half', '2025-05-30', 8000, '6월 평균기온 18-25도, 초여름 날씨'),
  ('인천 10K 런', '2025-09-07', '인천 송도센트럴파크', '10K', '송도 신도시를 달리는 10km 코스. 가족 단위 참가 환영합니다.', 20, 'Easy', 'https://example.com/incheon-10k', '2025-08-24', 5000, '9월 평균기온 18-26도'),
  ('수원 화성 마라톤', '2025-10-12', '수원 화성행궁', 'Full', '유네스코 세계문화유산 수원화성을 돌아보는 역사적인 코스.', 150, 'Moderate', 'https://example.com/suwon-marathon', '2025-09-27', 18000, '10월 쾌적한 가을 날씨')
ON CONFLICT DO NOTHING;

# 🏅 런카이빙 (Runchiving)

> **Of the runner, By the runner, For the runner**

**땀방울로 써내려간 당신의 러닝 히스토리**

러닝 메달 디지털 아카이빙 서비스

## 서비스 개요

- **서비스명**: 런카이빙 (Runchiving)
- **도메인**: runchiving.run (구매 예정)
- **컨셉**: 물리적 메달을 온라인에 보관하는 디지털 아카이빙 서비스
- **핵심 가치**: 단순 기록 관리가 아닌, 메달 컬렉션 아카이빙

## 타겟 유저

- 마라톤/러닝 대회 참가하는 러너들
- 메달 수집하는 사람들
- 본인의 러닝 기록을 의미있게 보관하고 싶은 사람들

## 주요 기능

### 🎖️ 메달 아카이브
- 대회 메달 사진 업로드 및 보관
- 대회 정보(대회명, 날짜, 기록, 거리) 등록
- 각 메달마다 회고록 작성 (감정, 컨디션, 날씨 등)

### 📅 대회 일정
- 전국 마라톤 대회 정보 조회
- 거리별/월별 필터링
- 대회 신청 현황 관리
- AI 기반 URL 분석으로 대회 정보 자동 추출 (예정)

### 📊 성장 타임라인
- 러닝 히스토리 시각화
- 연도별/거리별 메달 컬렉션 분류
- PB(Personal Best) 기록 관리

### 🏆 Hall of Fame
- 거리별 최고 기록 전시
- 개인 베스트 하이라이트

### 🔗 외부 연동
- Strava 연동 (구현 완료)
- Google 로그인 (구현 완료)

## 로드맵

### v1.0 (현재)
- [x] 홈페이지 리브랜딩 (MODURUN → Runchiving)
- [x] Google 로그인
- [x] Strava 연동
- [x] 대회 일정 조회
- [x] 기록 아카이브 CRUD
- [x] Supabase 연동

### v2.0 (예정)
- [ ] AI 기반 대회 URL 분석
- [ ] 3D 메달 컬렉션 뷰어
- [ ] 연말 "올해의 메달 컬렉션" 자동 생성
- [ ] 소셜 공유 기능
- [ ] 메달 사진 업로드 (Supabase Storage)

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Deployment**: Vercel
- **External API**: Strava API

## 시작하기

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Strava
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# AI (예정)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 프로젝트 히스토리

- **기존 URL**: https://v0-runner-app-eta.vercel.app/dashboard/records
- **기존 이름**: MODURUN (모두런)
- **리브랜딩**: 2024년 → Runchiving (런카이빙)

## 라이선스

MIT License

---

**Made with 💪 by runners, for runners**

*"Of the runner, By the runner, For the runner"*

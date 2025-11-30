import { Medal, Archive, Calendar, TrendingUp, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50"></div>

        {/* Floating medals decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-16 h-16 rounded-full border-2 border-primary/20 animate-pulse"></div>
          <div className="absolute top-40 right-[15%] w-12 h-12 rounded-full border-2 border-primary/30 animate-pulse delay-300"></div>
          <div className="absolute bottom-32 left-[20%] w-10 h-10 rounded-full border-2 border-primary/20 animate-pulse delay-500"></div>
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary bg-primary/20 px-5 py-2.5 text-sm font-medium text-primary shadow-lg shadow-primary/20">
              <Medal className="h-4 w-4" />
              <span>러너들의 메달 아카이브</span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
              땀방울로 써내려간
              <br />
              <span className="text-primary">당신의 러닝 히스토리</span>
            </h1>

            <p className="mb-8 text-lg text-gray-400 md:text-xl font-light max-w-2xl mx-auto">
              서랍 속에 잠들어 있는 메달들,
              이제 <span className="font-semibold text-white">Runchiving</span>에서 영원히 간직하세요.
              <br className="hidden md:block" />
              대회 메달부터 완주 기록까지, 당신의 러닝 여정을 아카이빙합니다.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 text-lg px-8 py-6 h-auto font-bold"
              >
                <Link href="/auth/sign-up">
                  메달 아카이빙 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/10 hover:text-white text-lg px-8 py-6 h-auto bg-transparent"
              >
                <Link href="/dashboard/records">내 컬렉션 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl mb-4">
              메달 하나하나에 담긴 이야기
            </h2>
            <p className="text-gray-400 text-lg">
              단순한 기록이 아닌, 추억을 간직하는 방법
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-primary/30">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Medal className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">메달 아카이브</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                대회 메달 사진과 함께
                <br />
                소중한 순간을 기록하세요
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-primary/30">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">회고록 작성</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                그날의 감정, 컨디션, 날씨까지
                <br />
                생생하게 남겨두세요
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-primary/30">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">성장 타임라인</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                첫 5K부터 풀코스까지
                <br />
                당신의 성장 과정을 한눈에
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-primary/30">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">대회 일정</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                다음 메달을 위한
                <br />
                대회 정보를 확인하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Archive Preview Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl mb-6">
                서랍 속 메달에
                <br />
                <span className="text-primary">새로운 생명을</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                열심히 달려서 받은 메달, 서랍 속에서 잠들어 있지 않나요?
                <br /><br />
                Runchiving은 당신의 메달을 디지털로 아카이빙합니다.
                언제 어디서나 꺼내볼 수 있는 나만의 메달 컬렉션을 만들어보세요.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  대회명, 날짜, 거리, 기록 자동 정리
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  메달 사진 & 완주 인증샷 보관
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  연도별, 거리별 컬렉션 분류
                </li>
              </ul>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/dashboard/records">
                  <Archive className="mr-2 h-4 w-4" />
                  아카이브 둘러보기
                </Link>
              </Button>
            </div>

            {/* Medal Collection Visual */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group hover:border-primary/50 transition-all hover:scale-105"
                  >
                    <Medal className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                + 더 많은 메달
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-background to-primary/10">
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Medal className="h-16 w-16 text-primary mx-auto mb-8" />
            <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
              다음 메달을 향해
              <br />
              달릴 준비 되셨나요?
            </h2>
            <p className="mb-10 text-xl text-gray-400">
              지금 바로 Runchiving과 함께 당신의 메달 컬렉션을 시작하세요.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-10 py-6 h-auto font-bold"
            >
              <Link href="/auth/sign-up">무료로 시작하기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 Runchiving. Made with 💪 by runners, for runners.</p>
        </div>
      </footer>
    </div>
  )
}

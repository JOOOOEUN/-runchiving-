import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Medal } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"


export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Medal className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Runchiving</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/races" className="text-sm font-medium transition-colors hover:text-primary">
            대회 일정
          </Link>
          <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
            둘러보기
          </Link>
          <Link href="/dashboard/records" className="text-sm font-medium transition-colors hover:text-primary">
            내 아카이브
          </Link>
          <Link href="/dashboard/timeline" className="text-sm font-medium transition-colors hover:text-primary">
            타임라인
          </Link>
          {user ? (
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10">
                로그아웃
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10">
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/sign-up">회원가입</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4">
              <Link href="/races" className="text-sm font-medium transition-colors hover:text-primary">
                대회 일정
              </Link>
              <Link href="/explore" className="text-sm font-medium transition-colors hover:text-primary">
                둘러보기
              </Link>
              <Link href="/dashboard/records" className="text-sm font-medium transition-colors hover:text-primary">
                내 아카이브
              </Link>
              <Link href="/dashboard/timeline" className="text-sm font-medium transition-colors hover:text-primary">
                타임라인
              </Link>
              <Link
                href="/dashboard/registrations"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                내 대회
              </Link>
              {user ? (
                <form action="/auth/signout" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start hover:text-primary hover:bg-primary/10"
                  >
                    로그아웃
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="ghost" className="justify-start hover:text-primary hover:bg-primary/10">
                    <Link href="/auth/login">로그인</Link>
                  </Button>
                  <Button asChild className="justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/auth/sign-up">회원가입</Link>
                  </Button>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">가입해주셔서 감사합니다!</CardTitle>
            <CardDescription>이메일을 확인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-pretty">
              회원가입이 완료되었습니다. 이메일로 전송된 확인 링크를 클릭하여 계정을 활성화해주세요.
            </p>
            <Button asChild className="w-full">
              <Link href="/">홈으로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

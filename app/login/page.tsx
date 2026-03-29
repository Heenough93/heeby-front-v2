import { AppShell } from "@/shared/components/layout/app-shell";
import { LoginForm } from "@/features/access/components/login-form";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

function normalizeNextPath(next?: string) {
  if (!next || !next.startsWith("/")) {
    return "/";
  }

  return next;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AppShell
      title="로그인"
      description="이메일과 비밀번호를 입력해 작성 기능과 비공개 기록에 접근합니다."
    >
      <LoginForm nextPath={normalizeNextPath(searchParams?.next)} />
    </AppShell>
  );
}

import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AppShell
      title="로그인"
      description="이메일과 비밀번호를 입력해 작성 기능과 비공개 기록에 접근합니다."
    >
      <LoginForm />
    </AppShell>
  );
}

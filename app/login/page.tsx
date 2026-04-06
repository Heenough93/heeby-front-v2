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
    <AppShell title="로그인" className="max-w-3xl">
      <LoginForm nextPath={normalizeNextPath(searchParams?.next)} />
    </AppShell>
  );
}

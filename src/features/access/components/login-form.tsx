"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/ui/use-toast-store";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const loginAsMember = useAccessStore((state) => state.loginAsMember);
  const accessMode = useAccessStore(getAccessMode);
  const showToast = useToastStore((state) => state.showToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (accessMode === "guest") {
      return;
    }

    router.replace(nextPath);
  }, [accessMode, nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsPending(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const payload = (await response.json()) as {
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(
          payload.code === "missing_credentials"
            ? payload.message ?? "로그인 계정이 준비되지 않았습니다."
            : payload.message ?? "로그인에 실패했습니다."
        );
        return;
      }

      loginAsMember();
      showToast({
        title: "로그인했습니다.",
        variant: "success"
      });
      router.push(nextPath);
    } catch {
      setError("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  if (accessMode !== "guest") {
    return (
      <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
        <p className="text-lg font-semibold">이미 로그인된 상태입니다.</p>
        <p className="mt-2 text-sm leading-6 text-ink/62">
          잠시 후 원래 보려던 화면으로 이동합니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={nextPath}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            계속 이동
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line/10 bg-paper px-5 py-3 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
          >
            홈으로 이동
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-8"
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">이메일</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@example.com"
          className={cn(
            "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-surface"
          )}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          className={cn(
            "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-surface"
          )}
        />
      </label>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/"
          className="rounded-full border border-line/10 bg-surface px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-coral/40 hover:bg-soft"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "확인 중..." : "로그인"}
        </button>
      </div>
    </form>
  );
}

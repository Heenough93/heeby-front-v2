"use client";

import Link from "next/link";
import { useAccessStore } from "@/stores/use-access-store";

export function GuestAccessNotice() {
  const loginAsMember = useAccessStore((state) => state.loginAsMember);

  return (
    <section className="mx-auto max-w-3xl rounded-[32px] border border-line/10 bg-surface p-8 shadow-card md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-coral">
        Guest Mode
      </p>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">
        이 화면은 로그인 후 사용할 수 있습니다.
      </h1>
      <p className="mt-4 text-base leading-7 text-ink/68">
        게스트 모드에서는 홈에서 서비스 구조만 확인할 수 있습니다. 기록 작성,
        템플릿 관리, 세부 화면은 일반 로그인 또는 어드민 모드에서 열어볼 수
        있습니다.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={loginAsMember}
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          일반 모드로 보기
        </button>
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

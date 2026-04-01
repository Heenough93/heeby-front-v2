"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFeatureKeyFromPath } from "@/features/access/lib/access-policy";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";

export function AccessGateNotice() {
  const pathname = usePathname();
  const accessMode = useAccessStore(getAccessMode);
  const featureKey = getFeatureKeyFromPath(pathname);

  if (accessMode === "guest") {
    return (
      <section className="mx-auto max-w-3xl rounded-[32px] border border-line/10 bg-surface p-8 shadow-card md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-coral">
          Guest Access
        </p>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">
          로그인 후 사용할 수 있습니다.
        </h1>
        <p className="mt-4 text-base leading-7 text-ink/68">
          {featureKey === "journalEditor"
            ? "기록 작성과 비공개 기록 관리는 로그인 후 사용할 수 있습니다."
            : featureKey === "travelEditor"
              ? "여행 생성, 수정, 방문지 편집은 로그인 후 사용할 수 있습니다."
            : "게스트 상태에서는 공개된 기록만 볼 수 있습니다. 공개 기록은 상세에서 전체 내용을 그대로 확인할 수 있습니다."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            로그인
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
    <section className="mx-auto max-w-3xl rounded-[32px] border border-line/10 bg-surface p-8 shadow-card md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-coral">
        Admin Access
      </p>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">
        어드민 권한이 필요합니다.
      </h1>
      <p className="mt-4 text-base leading-7 text-ink/68">
        이 화면은 템플릿 관리용 화면입니다. 헤더의 계정 영역에서 추가 암호를 입력해
        어드민 권한을 열면 접근할 수 있습니다.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          홈으로 이동
        </Link>
        <span className="self-center text-sm text-ink/60">
          로그인 상태에서 헤더의 `어드민 잠금 해제`를 사용하세요.
        </span>
      </div>
    </section>
  );
}

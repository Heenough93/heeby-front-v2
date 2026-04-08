"use client";

import { AppShell } from "@/shared/components/layout/app-shell";

export function AssetFlowScreen() {
  return (
    <AppShell title="현금흐름">
      <section className="rounded-[28px] border border-line/10 bg-surface p-8 shadow-card">
        <h2 className="text-2xl font-bold">현금흐름 준비 중</h2>
        <p className="mt-3 text-sm leading-6 text-ink/62">
          통장 쪼개기, 월급 배분, 실행 체크 흐름은 이 화면에서 이어집니다.
        </p>
      </section>
    </AppShell>
  );
}

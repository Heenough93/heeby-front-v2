import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function NewRecordPage() {
  return (
    <AppShell
      title="New Record"
      description="다음 단계에서 이 화면에 주제 선택, 템플릿 선택, 질문형 입력 플로우를 연결합니다."
      actions={
        <Link
          href="/templates"
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/20"
        >
          Browse templates
        </Link>
      }
    >
      <section className="rounded-[28px] bg-white p-8 shadow-card">
        <p className="text-lg font-semibold">기록 작성 플로우 준비 중</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
          현재는 템플릿 관리 기능부터 우선 구현했습니다. 다음 단계에서
          `주제 선택 → 템플릿 선택 → 질문 답변 → 저장` 흐름을 붙일 예정입니다.
        </p>
      </section>
    </AppShell>
  );
}

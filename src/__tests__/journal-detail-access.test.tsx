import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JournalDetail } from "@/components/journals/journal-detail";
import { useAccessStore } from "@/stores/use-access-store";
import { useJournalStore } from "@/stores/use-journal-store";
import { useJournalTemplateStore } from "@/stores/use-journal-template-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe("JournalDetail access", () => {
  beforeEach(() => {
    useAccessStore.setState({
      isAuthenticated: false,
      isAdminUnlocked: false
    });
    useJournalTemplateStore.setState({
      journalTemplates: [
        {
          id: "template-1",
          name: "공개 템플릿",
          theme: "개발",
          questions: ["질문 1"],
          visibility: "public",
          createdAt: "2026-03-01T00:00:00.000Z",
          updatedAt: "2026-03-01T00:00:00.000Z"
        }
      ]
    });
  });

  it("shows a public journal to guests", () => {
    useJournalStore.setState({
      journals: [
        {
          id: "journal-public",
          title: "공개 기록",
          theme: "개발",
          journalTemplateId: "template-1",
          visibility: "public",
          answers: [{ question: "질문 1", answer: "공개 답변" }],
          createdAt: "2026-03-02T00:00:00.000Z",
          updatedAt: "2026-03-02T00:00:00.000Z"
        }
      ]
    });

    render(<JournalDetail journalId="journal-public" />);

    expect(screen.getByText("공개 기록")).toBeInTheDocument();
    expect(screen.getAllByText("공개 답변")).toHaveLength(2);
  });

  it("hides a private journal from guests", () => {
    useJournalStore.setState({
      journals: [
        {
          id: "journal-private",
          title: "비공개 기록",
          theme: "개발",
          journalTemplateId: "template-1",
          visibility: "private",
          answers: [{ question: "질문 1", answer: "비공개 답변" }],
          createdAt: "2026-03-02T00:00:00.000Z",
          updatedAt: "2026-03-02T00:00:00.000Z"
        }
      ]
    });

    render(<JournalDetail journalId="journal-private" />);

    expect(screen.getByText("기록을 찾을 수 없습니다.")).toBeInTheDocument();
    expect(screen.queryByText("비공개 답변")).not.toBeInTheDocument();
  });
});

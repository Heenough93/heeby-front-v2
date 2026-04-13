import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoneyFlowAccounts } from "@/features/assets/components/money-flow/money-flow-accounts";
import { MoneyFlowRules } from "@/features/assets/components/money-flow/money-flow-rules";
import { StockIposTable } from "@/features/stocks/components/ipos/stock-ipos-table";
import { StockTradesTable } from "@/features/stocks/components/trades/stock-trades-table";

describe("financial action guards", () => {
  it("hides stock trade write actions when management is disabled", () => {
    render(
      <StockTradesTable
        scopeFilter="KR"
        onScopeChange={vi.fn()}
        canManage={false}
      />
    );

    expect(screen.queryByRole("button", { name: "현재가 갱신" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "수정" })).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: "삭제" })).toHaveLength(0);
  });

  it("shows stock trade write actions when management is enabled", () => {
    render(
      <StockTradesTable
        scopeFilter="KR"
        onScopeChange={vi.fn()}
        canManage
      />
    );

    expect(screen.getByRole("button", { name: "현재가 갱신" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "수정" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "삭제" }).length).toBeGreaterThan(0);
  });

  it("hides stock IPO write actions when management is disabled", () => {
    render(
      <StockIposTable
        scopeFilter="all"
        onScopeChange={vi.fn()}
        canManage={false}
      />
    );

    expect(screen.queryAllByRole("button", { name: "수정" })).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: "삭제" })).toHaveLength(0);
  });

  it("hides money flow account and rule write actions when management is disabled", () => {
    const { rerender } = render(<MoneyFlowAccounts canManage={false} />);

    expect(screen.getByText("현재 권한에서는 통장 목록을 조회할 수만 있습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "통장 추가" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "수정" })).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: "삭제" })).toHaveLength(0);

    rerender(<MoneyFlowRules canManage={false} />);

    expect(screen.getByText("현재 권한에서는 배분 규칙을 조회할 수만 있습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "규칙 추가" })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: "수정" })).toHaveLength(0);
    expect(screen.queryAllByRole("button", { name: "삭제" })).toHaveLength(0);
  });
});

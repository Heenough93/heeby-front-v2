"use client";

import Link from "next/link";
import { useState } from "react";
import { getAccessMode, useAccessStore } from "@/stores/use-access-store";
import { useToastStore } from "@/stores/use-toast-store";

export function AccessControl() {
  const accessMode = useAccessStore(getAccessMode);
  const logout = useAccessStore((state) => state.logout);
  const unlockAdmin = useAccessStore((state) => state.unlockAdmin);
  const exitAdmin = useAccessStore((state) => state.exitAdmin);
  const showToast = useToastStore((state) => state.showToast);
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  if (accessMode === "guest") {
    return (
      <Link
        href="/login"
        className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {accessMode === "admin" ? (
        <span className="hidden rounded-full border border-coral/25 bg-coral/10 px-3 py-2 text-xs font-semibold text-coral md:inline-flex">
          어드민 사용 중
        </span>
      ) : null}

      {accessMode === "member" ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setError("");
          }}
          className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          어드민 잠금 해제
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            exitAdmin();
            showToast({
              title: "어드민 모드를 종료했습니다.",
              variant: "info"
            });
          }}
          className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
        >
          어드민 종료
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          logout();
          showToast({
            title: "로그아웃했습니다.",
            variant: "info"
          });
        }}
        className="rounded-full border border-line/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
      >
        로그아웃
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 rounded-[24px] border border-line/10 bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">추가 암호 입력</p>
          <p className="mt-2 text-sm leading-6 text-ink/62">
            로그인한 상태에서 추가 암호를 입력하면 어드민 권한을 사용할 수 있습니다.
          </p>

          <form
            className="mt-4 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();

              const isValid = unlockAdmin(password);

              if (!isValid) {
                setError("암호가 맞지 않습니다.");
                showToast({
                  title: "어드민 암호가 올바르지 않습니다.",
                  variant: "error"
                });
                return;
              }

              setPassword("");
              setError("");
              setIsOpen(false);
              showToast({
                title: "어드민 모드가 활성화되었습니다.",
                variant: "success"
              });
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="어드민 암호"
              className="h-11 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition focus:border-coral"
            />
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setError("");
                  setPassword("");
                }}
                className="rounded-full border border-line/10 bg-paper px-4 py-2 text-sm font-semibold transition hover:border-coral/35 hover:bg-soft"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                잠금 해제
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

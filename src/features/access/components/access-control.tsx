"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getAccessMode,
  useAccessStore
} from "@/features/access/store/access-store";
import { useToastStore } from "@/stores/ui/use-toast-store";

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
      {accessMode === "member" ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setError("");
          }}
          className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          어드민
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
          className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
        >
          어드민 해제
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
                확인
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

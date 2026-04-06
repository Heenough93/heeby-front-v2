"use client";

import { FormEvent, useState } from "react";
import { useToastStore } from "@/stores/ui/use-toast-store";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const showToast = useToastStore((state) => state.showToast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError("이름, 이메일, 문의 내용을 모두 입력해주세요.");
      return;
    }

    setError("");
    setName("");
    setEmail("");
    setMessage("");
    showToast({
      title: "문의 내용을 남겼습니다.",
      description: "지금은 로컬 화면 기준으로만 저장 없이 처리됩니다.",
      variant: "success"
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[28px] border border-line/10 bg-surface p-6 shadow-card md:p-8"
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink/75">이름</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="이름"
          className={cn(
            "h-12 rounded-2xl border border-line/10 bg-paper px-4 text-sm outline-none transition",
            "focus:border-coral focus:bg-surface"
          )}
        />
      </label>

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
        <span className="text-sm font-semibold text-ink/75">문의 내용</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="문의 내용을 입력하세요."
          rows={7}
          className={cn(
            "rounded-2xl border border-line/10 bg-paper px-4 py-3 text-sm outline-none transition resize-y",
            "focus:border-coral focus:bg-surface"
          )}
        />
      </label>

      {error ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          보내기
        </button>
      </div>
    </form>
  );
}

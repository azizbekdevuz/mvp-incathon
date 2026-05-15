"use client";

import { useEffect, useState } from "react";

type ChatBubbleProps = {
  role: "npc" | "you" | "system";
  children: React.ReactNode;
  delay?: number;
};

export function ChatBubble({ role, children, delay = 0 }: ChatBubbleProps) {
  const [show, setShow] = useState(delay <= 0);

  useEffect(() => {
    if (delay <= 0) return;
    const t = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  const base =
    role === "you"
      ? "bubble-you ml-auto max-w-[92%] rounded-2xl rounded-tr-sm"
      : role === "npc"
        ? "bubble-npc mr-auto max-w-[92%] rounded-2xl rounded-tl-sm"
        : "mx-auto max-w-[95%] rounded-2xl border border-white/10 bg-white/5 text-center text-xs text-zinc-400";

  return (
    <div className={`animate-chat-in px-4 py-3 text-sm leading-relaxed ${base}`}>
      {children}
    </div>
  );
}

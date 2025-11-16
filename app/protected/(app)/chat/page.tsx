"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHera } from "@/lib/context/hera";
import HeraIconImage from "@/components/heraIconImage";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { setHeraStatus } = useHera();
  const [history, setHistory] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem("chatHistory");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse chat history", error);
      return [];
    }
  });

  // Strict Mode での二重書き込みを防ぐ
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  // 履歴が更新されるたびスクロール
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const newHistory = [...history, userMsg].slice(-5);
    setHistory(newHistory);
    setInput("");
    const messages = newHistory;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);
        toast.error(`サーバーエラー ${res.status}`);
        return;
      }

      // ボディを文字列で一度だけ読み込んでパース
      const bodyText = await res.text();
      let data: { reply: string; affection: number; delta: number };
      try {
        data = JSON.parse(bodyText);
      } catch {
        console.error("Invalid JSON:", bodyText);
        toast.error("サーバーから不正な応答を受信しました");
        return;
      }

      setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
      setHeraStatus({ delta: data.delta });
    } catch (e) {
      console.error(e);
      toast.error("通信エラーが発生しました");
    }
  };

  return (
    <div className="relative h-screen">
      <div
        ref={containerRef}
        className="overflow-auto space-y-4 p-4 pb-40"
        style={{ height: "100%", boxSizing: "border-box" }}
      >
        {history.map((m, i) => (
          <div
            key={i}
            className={`flex items-start ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && <HeraIconImage />}
            <div
              className={`max-w-[70%] p-2 rounded-lg break-words text-left ${
                m.role === "user"
                  ? "bg-pink-100 dark:bg-pink-700 text-black dark:text-white"
                  : "bg-stone-100 dark:bg-stone-700 text-black dark:text-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed left-0 right-0 p-4 bottom-16 md:bottom-0 bg-background/80">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="ヘラちゃんになんて言う？"
          />
          <Button onClick={send}>送信</Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useHera } from "@/lib/hera/context";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { setHeraStatus } = useHera();
  const [history, setHistory] = useState<Message[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("chatHistory");
    if (raw) setHistory(JSON.parse(raw));
  }, []);

  // ── 2) StrictMode で useEffect が二度呼ばれても保存は一度だけ
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    try {
      localStorage.setItem("chatHistory", JSON.stringify(history));
    } catch {
      console.error("localStorage error");
    }
  }, [history]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput("");
    const messages = newHistory.slice(-5);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages }),
      });
      const data = (await res.json()) as {
        reply: string;
        affection: number;
        delta: number;
      };
      setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
      setHeraStatus({
        delta: data.delta,
      });
    } catch (e) {
      console.error(e);
      toast.error("通信エラーが発生しました");
    }
  };

  return (
    <div className="relative h-screen">
      {/* メッセージリスト：下部固定領域分 = 入力欄(h-16) + ナビ(h-16) の余白 */}
      <div
        ref={containerRef}
        className="overflow-auto space-y-2 p-4 pb-32"
        style={{ height: "100%", boxSizing: "border-box" }}
      >
        {history.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div className="inline-block p-2 rounded-lg bg-gray-100">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* 入力エリアを固定 */}
      <div className="fixed left-0 right-0 p-4 bottom-16 md:bottom-0">
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

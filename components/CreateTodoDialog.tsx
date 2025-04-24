// app/protected/todos/CreateTodoDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = { userId: string };

export const CreateTodoDialog: React.FC<Props> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 過去日付のチェック
    if (date < today) {
      toast.error("過去の日付は選択できません");
      return;
    }
    setLoading(true);

    const [year, month, day] = date.split("-").map(Number);
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59);

    const { error } = await supabase.from("todo").insert({
      user_id: userId,
      title,
      description: description || null,
      deadline: deadlineDate,
      completed: false,
    });

    if (error) {
      toast.error("タスクの作成に失敗しました");
    } else {
      toast.success("タスクを作成しました");
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed right-4 bottom-20 md:top-6 md:right-6 md:bottom-auto z-50 w-14 h-14 flex items-center justify-center rounded-full bg-pink-400 text-stone-50 hover:bg-pink-500 shadow-lg"
          aria-label="新しいタスクを作成"
        >
          <Edit size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>新しいタスクを作成</DialogTitle>
          <DialogDescription>
            タイトルと締切日を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="todo-title">タイトル</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="todo-description">説明</Label>
            <Textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="todo-date">締切日</Label>
            <Input
              id="todo-date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              作成
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading}>
                キャンセル
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

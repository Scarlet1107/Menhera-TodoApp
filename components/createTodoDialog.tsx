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
import { updateAffection } from "@/app/protected/(app)/todos/actions";
import { useHera } from "@/lib/hera/context";
import { getActionMessage, HeraAction } from "@/lib/hera/actionMessage";

type CreateProps = { userId: string };
export const CreateTodoDialog: React.FC<CreateProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(today);
  const [loading, setLoading] = useState(false);
  const { affection, setHeraStatus } = useHera();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (date < today) {
      toast.error("過去の日付は選択できません");
      return;
    }
    setLoading(true);
    const [y, m, d] = date.split("-").map(Number);
    const deadline = new Date(y, m - 1, d, 23, 59, 59);
    const { error } = await supabase.from("todo").insert({
      user_id: userId,
      title,
      description: description || null,
      deadline,
      completed: false,
    });
    if (error) toast.error("タスク作成に失敗");
    else {
      const delta = 1;
      await updateAffection(userId, delta);
      const message = getActionMessage("create" as HeraAction, affection);
      setHeraStatus({
        affection: affection + delta,
        delta: delta,
        message: message,
      });
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="
            fixed right-4 bottom-20 
            md:bottom-30 md:right-20 
            z-50 w-16 h-16 md:w-20 md:h-20 rounded-full 
            bg-pink-400 border-2 border-pink-600 shadow-md 
            hover:bg-pink-500 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 
            transition-all duration-200 ease-in-out dark:text-white/90
          "
          aria-label="新規タスク"
        >
          <Edit size={24} className="md:text-3xl" />
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
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="desc">説明</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date">締切日</Label>
            <Input
              id="date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={loading}>
                キャンセル
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// app/protected/todos/EditTodoDialog.tsx
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
import { Edit2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Todo } from "@/lib/hera/types";
import { UpdateAffectionFn } from "@/app/protected/(app)/todos/actions";
import { useHera } from "@/lib/hera/context";
import { getActionMessage, HeraAction } from "@/lib/hera/actionMessage";
import { toJstDateString, jstDateStringToUtcIso } from "@/utils/date";
import { useAppMode } from "@/components/appModeProvider";

type EditProps = { todo: Todo; updateAffection: UpdateAffectionFn };
export const EditTodoDialog: React.FC<EditProps> = ({
  todo,
  updateAffection,
}) => {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // 日本時間基準で「今日」と「既存締切日」を文字列に
  const todayJst = toJstDateString(new Date());
  const initialDateJst = toJstDateString(new Date(todo.deadline));

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [date, setDate] = useState<string>(initialDateJst);
  const [loading, setLoading] = useState(false);
  const { affection, setHeraStatus } = useHera();
  const { mode } = useAppMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 編集後の日付を日本時間終日→UTC ISOへ変換
    const deadlineIso = jstDateStringToUtcIso(date);

    // 元の締切日文字列（JST）
    const originalDateOnly = initialDateJst;
    const newDateOnly = date;

    // DB 更新
    const { error } = await supabase
      .from("todo")
      .update({
        title,
        description: description || null,
        deadline: deadlineIso,
      })
      .eq("id", todo.id);

    if (error) {
      toast.error("更新失敗");
    } else {
      // 締切を延ばしたときだけペナルティ
      const isExtended = newDateOnly > originalDateOnly;
      if (isExtended) {
        const rawDelta = -4;
        const delta = mode === "dark" ? rawDelta * 2 : rawDelta;
        await updateAffection(todo.user_id, delta);
        const newAffection = Math.min(100, Math.max(0, affection + delta));
        const msg = getActionMessage("edit" as HeraAction, newAffection);
        setHeraStatus({
          affection: newAffection,
          delta: delta,
          message: msg,
        });
      } else {
        toast.success("タスクを更新しました");
      }

      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="px-0">
          <Edit2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>タスクを編集</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-2">
          修正後の内容を入力してください。
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="etitle">タイトル</Label>
            <Input
              id="etitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edesc">説明</Label>
            <Textarea
              id="edesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edate">締切日</Label>
            <Input
              id="edate"
              type="date"
              value={date}
              min={todayJst}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">キャンセル</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              更新
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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

type EditProps = { todo: Todo; updateAffection: UpdateAffectionFn };
export const EditTodoDialog: React.FC<EditProps> = ({
  todo,
  updateAffection,
}) => {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const d0 = todo.deadline.toString().slice(0, 10);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [date, setDate] = useState<string>(d0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (date < today) {
      toast.error("過去日は不可");
      return;
    }
    setLoading(true);
    const [y, m, d] = date.split("-").map(Number);
    const deadline = new Date(y, m - 1, d, 23, 59, 59);
    const { error } = await supabase
      .from("todo")
      .update({ title, description: description || null, deadline })
      .eq("id", todo.id);
    if (error) toast.error("更新失敗");
    else {
      await updateAffection(todo.user_id, -3);
      toast.success("タスクを更新しました。好感度 -3");
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
              min={today}
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

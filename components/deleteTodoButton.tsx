// components/DeleteTodoButton.tsx
"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { UpdateAffectionFn } from "@/app/protected/(app)/todos/actions";
import { getActionMessage, HeraAction } from "@/lib/hera/actionMessage";
import { useHera } from "@/lib/hera/context";

// Props for deletion button
export type DeleteTodoProps = {
  todoId: string;
  userId: string;
  updateAffection: UpdateAffectionFn;
};

export const DeleteTodoButton: React.FC<DeleteTodoProps> = ({
  todoId,
  userId,
  updateAffection,
}) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { affection, setHeraStatus } = useHera();

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("todo").delete().eq("id", todoId);
    if (error) {
      toast.error("削除に失敗しました");
    } else {
      const delta = -6;
      await updateAffection(userId, delta);
      const msg = getActionMessage("delete" as HeraAction, affection);
      const newAffection = Math.min(100, Math.max(0, affection + delta));
      setHeraStatus({
        affection: newAffection,
        delta: delta,
        message: msg,
      });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading} className="px-0">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

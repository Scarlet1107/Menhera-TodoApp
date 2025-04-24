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

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("todo").delete().eq("id", todoId);
    if (error) {
      toast.error("削除に失敗しました");
    } else {
      await updateAffection(userId, -5);
      toast.warning("タスクを削除しました。好感度 -5");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
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

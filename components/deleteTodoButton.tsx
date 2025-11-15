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
import { useAppMode } from "@/components/appModeProvider";
import type { Todo } from "@/lib/hera/types";
import {
  getAffectionDeltaForMode,
  getModeAdjustedValue,
  getTodoReward,
} from "@/constants/todoRewards";
import { applyCoinChange } from "@/lib/coins/applyCoinChange";

// Props for deletion button
export type DeleteTodoProps = {
  todo: Todo;
  userId: string;
  updateAffection: UpdateAffectionFn;
};

export const DeleteTodoButton: React.FC<DeleteTodoProps> = ({
  todo,
  userId,
  updateAffection,
}) => {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { affection, setHeraStatus } = useHera();
  const { mode } = useAppMode();

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("todo")
      .delete()
      .eq("id", todo.id);
    if (error) {
      toast.error("削除に失敗しました");
    } else {
      const reward = getTodoReward(todo.difficulty, "delete");
      const affectionDelta = getAffectionDeltaForMode(reward.affection, mode);
      const coinDelta = getModeAdjustedValue(reward.coins, mode);

      await updateAffection(userId, affectionDelta);
      const newAffection = Math.min(
        100,
        Math.max(0, affection + affectionDelta)
      );
      const msg = getActionMessage("delete" as HeraAction, newAffection);
      setHeraStatus({
        affection: newAffection,
        delta: affectionDelta,
        message: msg,
      });

      try {
        await applyCoinChange({
          supabase,
          userId,
          amount: coinDelta,
          type: "todo_reward",
          todoId: todo.id,
          notificationContent:
            coinDelta >= 0
              ? `Todo削除でヘラコインを${coinDelta}枚獲得しました`
              : `Todo削除でヘラコインを${Math.abs(coinDelta)}枚失いました`,
        });
      } catch (coinError) {
        console.error("コインの更新に失敗", coinError);
        toast.error("コインの更新に失敗しました");
      }
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

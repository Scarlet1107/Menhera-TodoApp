// app/protected/todos/CompleteCheckbox.tsx
"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useHera } from "@/lib/context/hera";
import { getActionMessage } from "@/lib/hera/actionMessage";
import { useAppMode } from "@/components/appModeProvider";
import type { Todo } from "@/lib/hera/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { UpdateAffectionFn } from "@/app/protected/(app)/todos/actions";
import {
  getAffectionDeltaForMode,
  getModeAdjustedValue,
  getTodoReward,
} from "@/constants/todoRewards";
import { applyCoinChange } from "@/lib/coins/applyCoinChange";

interface Props {
  todo: Todo;
  userId: Todo["user_id"];
  updateAffection: UpdateAffectionFn;
}

export const CompleteCheckbox: React.FC<Props> = ({
  todo,
  userId,
  updateAffection,
}) => {
  const supabase = createClient();
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(todo.completed);
  const [loading, setLoading] = useState<boolean>(false);
  const { affection, setHeraStatus } = useHera();
  const { mode } = useAppMode();
  const [rewardGiven, setRewardGiven] = useState<boolean>(
    todo.reward_given
  );

  const handleCheckboxChange = async (newChecked: boolean) => {
    // Optimistic UI update
    setChecked(newChecked);
    setLoading(true);

    // DB 更新
    const { error } = await supabase
      .from("todo")
      .update({ completed: newChecked, reward_given: newChecked })
      .eq("id", todo.id);

    if (error) {
      console.error("Supabase update error:", error.message);
      // Revert on error
      setChecked(!newChecked);
      toast.error("タスクの状態更新に失敗しました");
    } else {
      const phase = newChecked ? "complete" : "revert";
      const reward = getTodoReward(todo.difficulty, phase);
      const affectionDelta = getAffectionDeltaForMode(reward.affection, mode);
      await updateAffection(userId, affectionDelta);
      const newAffection = Math.min(
        100,
        Math.max(0, affection + affectionDelta)
      );
      const msg = getActionMessage(
        newChecked ? "complete" : "uncomplete",
        newAffection
      );
      setHeraStatus({
        affection: newAffection,
        delta: affectionDelta,
        message: msg,
      });

      const shouldApplyCoinChange = newChecked ? !rewardGiven : rewardGiven;
      if (shouldApplyCoinChange) {
        const coinDelta = getModeAdjustedValue(reward.coins, mode);
        try {
          await applyCoinChange({
            supabase,
            userId,
            amount: coinDelta,
            type: "todo_reward",
            todoId: todo.id,
            notificationContent:
              coinDelta >= 0
                ? `Todoを完了してヘラコインを${coinDelta}枚獲得しました`
                : `Todoを未完了に戻してヘラコインを${Math.abs(coinDelta)}枚失いました`,
          });
        } catch (coinError) {
          console.error("コインの更新に失敗", coinError);
          toast.error("コインの更新に失敗しました");
        }
      }

      setRewardGiven(newChecked);
      // ページ再取得
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Checkbox
      id={`todo-checkbox-${todo.id}`}
      checked={checked}
      onCheckedChange={handleCheckboxChange}
      disabled={loading}
      aria-label="完了/未完了切り替え"
      className="h-6 w-6"
    />
  );
};

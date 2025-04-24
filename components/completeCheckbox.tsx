// app/protected/todos/CompleteCheckbox.tsx
"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/hera/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { UpdateAffectionFn } from "@/app/protected/(app)/todos/actions";

interface Props {
  id: Todo["id"];
  completed: Todo["completed"];
  userId: Todo["user_id"];
  updateAffection: UpdateAffectionFn;
}

export const CompleteCheckbox: React.FC<Props> = ({
  id,
  completed,
  userId,
  updateAffection,
}) => {
  const supabase = createClient();
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(completed);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheckboxChange = async (newChecked: boolean) => {
    // Optimistic UI update
    setChecked(newChecked);
    setLoading(true);

    // DB 更新
    const { error } = await supabase
      .from("todo")
      .update({ completed: newChecked })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error.message);
      // Revert on error
      setChecked(!newChecked);
      toast.error("タスクの状態更新に失敗しました");
    } else {
      // 好感度更新 (+3 or -4)
      const delta = newChecked ? 3 : -4;
      await updateAffection(userId, delta);
      toast.success(
        `タスクを${newChecked ? "完了" : "未完了"}にしました。好感度 ${
          delta > 0 ? "+" : ""
        }${delta}`
      );
      // ページ再取得
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <Checkbox
      id={`todo-checkbox-${id}`}
      checked={checked}
      onCheckedChange={handleCheckboxChange}
      disabled={loading}
      aria-label="完了/未完了切り替え"
    />
  );
};

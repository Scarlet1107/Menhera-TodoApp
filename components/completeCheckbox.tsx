// app/protected/todos/CompleteCheckbox.tsx
"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/hera/types";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Props {
  id: Todo["id"];
  completed: Todo["completed"];
}

export const CompleteCheckbox: React.FC<Props> = ({ id, completed }) => {
  const supabase = createClient();
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(completed);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheckboxChange = async (newChecked: boolean) => {
    // Optimistic UI update
    setChecked(newChecked);
    setLoading(true);

    const { error } = await supabase
      .from("todo")
      .update({ completed: newChecked })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error.message);
      // Revert on error
      setChecked(!newChecked);
    } else {
      // リフレッシュしてサーバーコンポーネントを再描画
      if (newChecked) toast("タスクを完了しました");
      else toast("タスクを復元しました");
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

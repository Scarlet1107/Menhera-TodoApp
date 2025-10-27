"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";

interface Props {
  initial: "casual" | "hard";
  userId: string;
}

export default function DifficultySwitch({ initial, userId }: Props) {
  const [value, setValue] = useState(initial === "hard");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setPending(true);
    const newDifficulty = value ? "casual" : "hard";
    const supabase = await createClient();
    await supabase
      .from("profile")
      .update({ difficulty: newDifficulty })
      .eq("user_id", userId);
    setValue(!value);
    setPending(false);
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex items-center space-x-2">
          <Switch checked={value} onCheckedChange={() => {}} />
          <span>{value ? "Hard モード" : "Casual モード"}</span>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {value ? "Casual に戻しますか？" : "Hard に切り替えますか？"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={toggle} disabled={pending}>
            {value ? "Casual に戻す" : "Hard に切り替え"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

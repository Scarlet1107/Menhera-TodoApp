// File: app/protected/bad-end/BadEndClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  action: () => Promise<void>;
}

export default function BadEndClient({ action }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => setOpen(true), []);

  const onDelete = async () => {
    await action();
    toast("さよなら…君と過ごした時間、忘れないよ…💔");
    router.push("/");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>……もう君はいらないの？</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col items-center space-y-4">
              <p>ずっと待ってたのに…来ないなら、私…消えちゃうから…</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={onDelete}>
            アカウントを消去する
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

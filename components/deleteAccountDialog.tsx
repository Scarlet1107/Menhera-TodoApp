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
import Image from "next/image";

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
          <AlertDialogTitle className="text-red-700">
            ……もう君はいらないの？
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-red-500">
                ずっと待ってたのに…来ないなら、私…消えちゃうから…
              </p>
              <Image
                src="/hera-chan/special/bad-end.png"
                width={200}
                height={200}
                alt="バッドエンドへらちゃん"
                className="-mb-12 -mt-4"
              />
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

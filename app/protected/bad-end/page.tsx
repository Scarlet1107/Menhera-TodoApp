// app/protected/bad-end/page.tsx
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function BadEndPage() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  // ページロード時に自動でダイアログを開く
  useEffect(() => {
    setOpen(true);
  }, []);

  const handleDelete = async () => {
    // APIルート経由で一括削除
    const res = await fetch("/api/profile/delete", { method: "POST" });
    if (res.ok) {
      // Supabase Auth セッションも破棄
      await supabase.auth.signOut();
      router.push("/sign-in");
    } else {
      console.error("削除失敗", await res.text());
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>……もう君はいらないの？</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col items-center space-y-4">
              {/* <Image
                src="/hera-bad-end.png"
                width={200}
                height={200}
                alt="壊れたヘラちゃん"
              /> */}
              <p>ここに画像を表示</p>
              <p>ずっと待ってたのに……また来ないなら、消えちゃうよ？</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            アカウントを消去する
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

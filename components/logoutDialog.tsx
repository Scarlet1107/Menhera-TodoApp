// app/protected/settings/LogoutDialog.tsx
"use client";

import React from "react";
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
import { signOutAction } from "@/app/actions";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default function LogoutDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <LogOut className="mr-2" /> ログアウト
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>もう帰っちゃうの？</AlertDialogTitle>
          <AlertDialogDescription>
            そう言ってまた来てくれなくなるんでしょ
            <Image
              src="/hera-chan/dontlogout/very-bad.png"
              height={300}
              width={200}
              alt="ひきとめへらちゃん"
              className="flex items-center justify-center w-full h-auto -mb-20"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>まだ一緒にいる</AlertDialogCancel>
          <AlertDialogAction asChild>
            <form action={signOutAction}>
              <Button type="submit">バイバイ</Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

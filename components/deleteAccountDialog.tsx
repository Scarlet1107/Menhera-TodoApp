"use client";

import { useState, useTransition } from "react";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserX } from "lucide-react";

export function DeleteAccountDialog() {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canDelete = confirmText === "削除" && !isPending;

  const handleDelete = () => {
    if (!canDelete) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile/delete", { method: "DELETE" });
        console.log("delete response", res);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = body?.error ?? "削除に失敗しました";
          toast.error(message);
          return;
        }
        toast.success("アカウントを削除しました");
        router.replace("/")
      } catch (error) {
        console.error("account delete failed", error);
        toast.error("削除に失敗しました");
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full flex items-center justify-center"
        >
          <UserX className="mr-2 h-4 w-4" />
          退会する
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3" asChild>
            <ul className="list-disc space-y-1 pl-6 text-sm text-start">
              <li>プロフィール、Todo、所持アイテムなどすべてのデータが削除されます。</li>
              <li>削除後、このアカウントは再利用できません。</li>
              <li className="font-semibold text-destructive">この操作は取り消せず、復元できません。</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">確認のため「削除」と入力してください</Label>
          <Input
            id="confirm-delete"
            placeholder="削除"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isPending}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>やめる</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isPending ? "削除中..." : "本当に削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

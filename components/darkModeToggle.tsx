"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useAppMode } from "@/components/appModeProvider";
import type { AppMode } from "@/constants/mode";
import { toast } from "sonner";

export function DarkModeToggle() {
  const { mode, setMode, isUpdating } = useAppMode();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isDark = mode === "dark";
  const nextMode: AppMode = isDark ? "normal" : "dark";

  const handleConfirm = async () => {
    setPending(true);
    try {
      await setMode(nextMode);
    } catch {
      toast.error("モードの更新に失敗しました。時間を空けて再度お試しください。");
    } finally {
      setPending(false);
      setDialogOpen(false);
    }
  };

  const disabled = isUpdating || pending;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled=true]:opacity-60 data-[disabled=true]:cursor-not-allowed"
          data-disabled={disabled ? "true" : "false"}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
        >
          <div>
            <p className="text-sm font-semibold">ダークモード</p>
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {isDark
                ? "有効中"
                : "ノーマルモードでプレイ中"}
            </p>
          </div>
          <Switch checked={isDark} className="pointer-events-none" />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {nextMode === "dark"
              ? "ダークモードに切り替えますか？"
              : "ノーマルモードに戻しますか？"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {nextMode === "dark"
              ? "高感度の減少が厳しくなり、ログイン間隔に応じたペナルティや期限切れTodoの自動削除が有効になります。よろしいですか？"
              : "ノーマルモードに戻すとペナルティが緩和され、イベントが制限されます。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            {pending ? "更新中..." : nextMode === "dark" ? "ダークモードに切り替え" : "ノーマルモードに戻す"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

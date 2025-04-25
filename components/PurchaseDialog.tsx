// app/shop/PurchaseAction.tsx (Client Component)
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { updateAffection } from "../app/protected/(app)/todos/actions";
import { useHera } from "@/lib/hera/context";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PurchaseDialog({
  item,
  userId,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    affectionGain: number;
    contentSrc?: string;
    isComingSoon: boolean;
  };
  userId: string;
}) {
  const { affection, setHeraStatus } = useHera();
  const router = useRouter();

  const handlePurchase = async () => {
    await updateAffection(userId, item.affectionGain);
    const msg =
      item.name === "ケーキ"
        ? `${item.name}を買ってくれたの？これ一番好きなやつ！ありがとう。`
        : item.name === "プリン"
          ? `${item.name}を買ってくれたの？これ好きなお店プリンだ！わざわざ並んでくれたの？`
          : `${item.name}を買ってくれたの？ありがとう！`;
    const newAffection = Math.min(
      100,
      Math.max(0, affection + item.affectionGain)
    );
    setHeraStatus({
      affection: newAffection,
      delta: item.affectionGain,
      message: msg,
    });
    router.push("/protected/home");
  };

  if (item.isComingSoon) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>購入</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col items-center">
              {item.name} を購入しますか？
              <br />
              デモ版のため無料でお試しいただけます。
              {item.contentSrc && (
                <Image
                  src={item.contentSrc}
                  height={200}
                  width={200}
                  alt="へらかわってコト！？"
                  className="-my-4"
                />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction disabled>Coming Soon</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>購入</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認</AlertDialogTitle>
          <AlertDialogDescription>
            {item.name} を購入しますか？
            <br />
            デモ版のため無料でお試しいただけます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handlePurchase}>
            購入する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

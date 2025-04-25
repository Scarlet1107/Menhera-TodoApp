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
import { updateAffection } from "../todos/actions";
import { useHera } from "@/lib/hera/context";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PurchaseAction({
  item,
  userId,
}: {
  item: {
    id: string;
    name: string;
    price: number;
    affectionGain: number;
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
    return <Button disabled>準備中</Button>;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>購入</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>購入の確認</AlertDialogTitle>
          <AlertDialogDescription>
            {item.name} を {item.price}円 で購入しますか？
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

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PurchaseItemResult } from "@/app/protected/(app)/shop/actions";
import { useNotification } from "@/lib/context/notification";
import { useProfile } from "@/lib/context/profile";
import type { Item as PrismaItem, Notification } from "@/lib/generated/prisma";
import { formatPrice } from "@/utils/formatPrice";
import { cn } from "@/lib/utils";

export type ShopItem = PrismaItem & { ownedQuantity: number };

type ShopItemListProps = {
  items: ShopItem[];
  userBalance: number;
  purchaseAction: (itemId: string) => Promise<PurchaseItemResult>;
};

const slotLabels: Record<ShopItem["slot"], string> = {
  frontHair: "前髪",
  backHair: "後ろ髪",
  clothes: "服",
  none: "その他",
};

const getItemImageMeta = (
  item: ShopItem
): { src: string; show: boolean } | null => {
  if (!item.previewImageFilename) return null;
  return { src: `/shop/${item.previewImageFilename}.png`, show: true };
};

export function ShopItemList({
  items,
  userBalance,
  purchaseAction,
}: ShopItemListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { setNotifications } = useNotification();
  const { setProfile } = useProfile();
  const router = useRouter();

  const handlePurchase = async (itemId: string, itemName: string) => {
    setPendingId(itemId);
    try {
      const result = await purchaseAction(itemId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (typeof result.newBalance === "number") {
        setProfile({ menheraCoin: result.newBalance });
      }

      if (result.notification) {
        const notification: Notification = {
          id: result.notification.id,
          userId: result.notification.userId,
          type: result.notification.type,
          content: result.notification.content,
          isRead: result.notification.isRead,
          createdAt: new Date(result.notification.createdAt),
        };
        setNotifications((prev) => [notification, ...prev]);
      }
      router.refresh();
    } catch (error) {
      console.error("purchase failed", error);
      toast.error("購入処理に失敗しました");
    } finally {
      setPendingId(null);
    }
  };

  if (!items.length) {
    return (
      <Card className="border-dashed border-pink-200">
        <CardHeader>
          <CardTitle>ショップアイテム</CardTitle>
          <CardDescription>現在購入できるアイテムはありません。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOwned = item.ownedQuantity > 0;
        const isLocked = item.isUnique && isOwned;
        const isConsumable = item.category === "consumable";
        const previewMeta = getItemImageMeta(item);
        const hasPreview = Boolean(previewMeta?.show);
        const canAfford = typeof item.price === "number" && userBalance >= item.price;
        const isPending = pendingId === item.id;
        const buttonDisabled = isLocked || isPending || !canAfford;
        const buttonLabel = isLocked
          ? "購入済み"
          : !canAfford
            ? "ヘラコインが足りません"
            : isPending
              ? "購入処理中..."
              : "購入";

        return (
          <Card key={item.id} className="border-pink-100 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-pink-600">
                      {item.category === "cosmetic" ? "コスメ" : "消費"}
                    </span>
                    {item.category === "cosmetic" && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-600">
                        {slotLabels[item.slot]}
                      </span>
                    )}
                    {isOwned && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        所持中{item.ownedQuantity > 1 ? ` x${item.ownedQuantity}` : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                {hasPreview ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                    <Image
                      src={previewMeta!.src}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-pink-50 to-white text-center text-[11px] text-pink-400">
                    <span className="font-semibold text-pink-600">
                      {slotLabels[item.slot] ?? "アイテム"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">プレビューなし</span>
                  </div>
                )}
              </div>
              {item.description && (
                <CardDescription className="text-sm text-muted-foreground">
                  {item.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1 text-sm text-pink-700">
                  <div>
                    価格: {item.price != null ? `${formatPrice(item.price)} コイン` : "-"}
                  </div>
                  {isConsumable && (
                    <div className="text-xs text-muted-foreground">
                      現在の所持数: {item.ownedQuantity}個
                    </div>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={buttonDisabled}
                      className={cn(
                        "w-full md:w-auto",
                        buttonDisabled
                          ? "bg-gray-200 text-gray-500"
                          : "bg-pink-500 text-white hover:bg-pink-600"
                      )}
                    >
                      {buttonLabel}
                    </Button>
                  </AlertDialogTrigger>
                  {!isLocked && canAfford && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {item.name}を購入しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {item.price != null ? formatPrice(item.price) : "-"}メンヘラコインを消費して購入します。
                          <br />
                          {isConsumable
                            ? "購入すると所持数に追加されます。"
                            : "購入後すぐにクローゼットで着替えられます。"}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handlePurchase(item.id, item.name)}
                          disabled={isPending}
                        >
                          {isPending ? "購入中..." : "購入する"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

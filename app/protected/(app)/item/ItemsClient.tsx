"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeraMessage from "@/components/heraMessage";
import HeraIconImage from "@/components/heraIconImage";
import { useHera } from "@/lib/context/hera";
import { useProfile } from "@/lib/context/profile";
import { cn } from "@/lib/utils";
import type { ConsumeItemResult } from "./actions";
import { ClosetClient } from "../closet/ClosetClient";

export type ConsumableItem = {
  itemId: string;
  name: string;
  description: string | null;
  affectionGain: number;
  quantity: number;
  previewImageFilename: string | null;
};

type ItemsClientProps = {
  closetProps: React.ComponentProps<typeof ClosetClient>;
  consumables: ConsumableItem[];
  consumeAction: (itemId: string, quantity: number) => Promise<ConsumeItemResult>;
  initialTab: "closet" | "consumable";
};

export function ItemsClient({
  closetProps,
  consumables,
  consumeAction,
  initialTab,
}: ItemsClientProps) {
  const [tab, setTab] = useState<"closet" | "consumable">(initialTab);
  const [items, setItems] = useState<ConsumableItem[]>(consumables);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(consumables.map((item) => [item.itemId, 1]))
  );
  const { affection, setHeraStatus } = useHera();
  const { setProfile } = useProfile();

  const hasConsumables = useMemo(() => items.length > 0, [items]);

  const handleQuantityChange = (itemId: string, value: string, max: number) => {
    const parsed = Number.parseInt(value, 10);
    const next = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), max) : 1;
    setQuantities((prev) => ({ ...prev, [itemId]: next }));
  };

  const handleConsume = async (itemId: string) => {
    const target = items.find((item) => item.itemId === itemId);
    if (!target) return;

    const quantity = quantities[itemId] ?? 1;
    if (quantity <= 0) return;

    setPendingId(itemId);
    try {
      const result = await consumeAction(itemId, quantity);
      if (!result.success) return;

      setItems((prev) =>
        prev
          .map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: result.remainingQuantity }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
      setQuantities((prev) => ({
        ...prev,
        [itemId]: Math.min(1, result.remainingQuantity),
      }));

      const newAffection = result.newAffection ?? affection;
      const delta = result.affectionDelta ?? 0;
      setHeraStatus({
        affection: newAffection,
        delta,
        message: result.message,
      });
      setProfile({ affection: newAffection });
    } catch (error) {
      console.error("consume item failed", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = value as typeof tab;
          setTab(next);
          document.cookie = `itemTab=${next}; path=/protected/item; max-age=${60 * 60 * 24 * 30}`;
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="closet">着せ替え</TabsTrigger>
          <TabsTrigger value="consumable">消費アイテム</TabsTrigger>
        </TabsList>

        <TabsContent value="closet" className="mt-4">
          <ClosetClient {...closetProps} />
        </TabsContent>

        <TabsContent value="consumable" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <HeraIconImage />
            <HeraMessage />
          </div>
          {!hasConsumables ? (
            <Card className="border-dashed border-pink-200">
              <CardHeader>
                <CardTitle>消費アイテム</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => {
                const selectedQty = quantities[item.itemId] ?? 1;
                const isPending = pendingId === item.itemId;
                const previewSrc = item.previewImageFilename
                  ? `/shop/${item.previewImageFilename}.png`
                  : null;

                return (
                  <Card key={item.itemId} className="border-pink-100">
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">
                            所持数: {item.quantity}
                          </Badge>
                          <Badge variant="outline">好感度 +{item.affectionGain} / 個</Badge>
                        </div>
                      </div>
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-b from-pink-50 to-white">
                        {previewSrc ? (
                          <Image
                            src={previewSrc}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-pink-500">プレビューなし</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`consume-qty-${item.itemId}`}
                            className="text-sm text-muted-foreground"
                          >
                            使う数
                          </label>
                          <Input
                            id={`consume-qty-${item.itemId}`}
                            type="number"
                            min={1}
                            max={item.quantity}
                            value={selectedQty}
                            onChange={(e) =>
                              handleQuantityChange(item.itemId, e.target.value, item.quantity)
                            }
                            className="w-24"
                          />
                          <span className="text-xs text-muted-foreground">
                            （最大{item.quantity}個）
                          </span>
                        </div>
                        <Button
                          onClick={() => void handleConsume(item.itemId)}
                          disabled={isPending || item.quantity <= 0}
                          className={cn(
                            "w-full md:w-auto",
                            isPending ? "bg-gray-200 text-gray-500" : "bg-pink-500 hover:bg-pink-600"
                          )}
                        >
                          {isPending ? "消費中..." : "使う"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

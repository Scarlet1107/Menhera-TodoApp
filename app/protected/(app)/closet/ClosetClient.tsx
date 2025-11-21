"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeraPreview } from "@/components/HeraPreview";
import { useHera } from "@/lib/context/hera";
import { useProfile } from "@/lib/context/profile";
import type { UpdateAppearancePayload, UpdateAppearanceResult } from "./actions";
import { cn } from "@/lib/utils";

type SlotName = "frontHair" | "backHair" | "clothes";

type ClosetItem = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  slot: SlotName;
};

type ClosetClientProps = {
  slots: Record<SlotName, ClosetItem[]>;
  initialSelection: Record<SlotName, string | null>;
  initialKeys: {
    frontHairKey: string;
    backHairKey: string;
    clothesKey: string;
  };
  updateAction: (payload: UpdateAppearancePayload) => Promise<UpdateAppearanceResult>;
};

const slotLabels: Record<SlotName, string> = {
  frontHair: "前髪",
  backHair: "後ろ髪",
  clothes: "洋服",
};

const defaultOption = {
  id: "default",
  name: "デフォルト",
  description: "初期スタイル",
  key: "default",
};

export function ClosetClient({
  slots,
  initialSelection,
  initialKeys,
  updateAction,
}: ClosetClientProps) {
  const [selection, setSelection] =
    useState<Record<SlotName, string | null>>(initialSelection);
  const [activeTab, setActiveTab] = useState<SlotName>("frontHair");
  const [isSaving, setIsSaving] = useState(false);
  const { moodKey, setHeraStatus } = useHera();
  const { setProfile } = useProfile();
  const router = useRouter();

  const itemKeyMap = useMemo(() => {
    const map = new Map<string, string>();
    (Object.values(slots).flat() as ClosetItem[]).forEach((item) => {
      const normalizedKey = item.key.replace(/\.png$/i, "");
      map.set(item.id, normalizedKey);
    });
    return map;
  }, [slots]);

  const previewAppearance = useMemo(() => ({
    frontHairKey: selection.frontHair
      ? itemKeyMap.get(selection.frontHair) ?? initialKeys.frontHairKey
      : "default",
    backHairKey: selection.backHair
      ? itemKeyMap.get(selection.backHair) ?? initialKeys.backHairKey
      : "default",
    clothesKey: selection.clothes
      ? itemKeyMap.get(selection.clothes) ?? initialKeys.clothesKey
      : "default",
  }), [selection, itemKeyMap, initialKeys]);

  const persistSelection = async (nextSelection: Record<SlotName, string | null>) => {
    setIsSaving(true);
    try {
      const payload: UpdateAppearancePayload = {
        frontHairItemId: nextSelection.frontHair,
        backHairItemId: nextSelection.backHair,
        clothesItemId: nextSelection.clothes,
      };
      const result = await updateAction(payload);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("着せ替えを更新しました");
      setHeraStatus({
        appearance: result.appearance,
      });
      setProfile({
        frontHairItemId: nextSelection.frontHair,
        backHairItemId: nextSelection.backHair,
        clothesItemId: nextSelection.clothes,
      });
      router.refresh();
    } catch (error) {
      console.error("update appearance failed", error);
      toast.error("着せ替えの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelect = (slot: SlotName, value: string) => {
    const nextSelection = {
      ...selection,
      [slot]: value === "default" ? null : value,
    };
    setSelection(nextSelection);
    void persistSelection(nextSelection);
  };

  const renderSlotContent = (slot: SlotName) => {
    const items = slots[slot];
    const hasDefault = items.some((item) => item.key === "default");
    const options: (ClosetItem & { id: string })[] = hasDefault
      ? items
      : [{ ...defaultOption, slot }, ...items];

    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {options.map((item) => {
            const isDefaultOption =
              item.key === "default" || item.id === "default";
            const isActive =
              (selection[slot] === null && isDefaultOption) ||
              selection[slot] === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(slot, item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-colors",
                  isActive
                    ? "border-pink-500 bg-pink-50"
                    : "border-pink-100 hover:border-pink-300"
                )}
                aria-pressed={isActive}
              >
                <div className="text-sm font-semibold text-pink-700">
                  {item.name}
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {item.description || "説明はありません"}
                </p>
              </button>
            );
          })}
        </div>
        {!items.length && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            まだ{slotLabels[slot]}アイテムを持っていません。ガチャやショップでゲットしてね。
          </p>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>着せ替えプレビュー</CardTitle>
          <CardDescription>選択しているスタイルがすぐに確認できます。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <HeraPreview
            appearance={previewAppearance}
            moodKey={moodKey}
            className="h-72 w-56"
            sizes="220px"
          />
          <p className="text-xs text-muted-foreground">
            着せ替えを保存するとホーム画面にも反映されます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>所持アイテム</CardTitle>
          <CardDescription>スロットごとに装備するアイテムを選択できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SlotName)}>
            <TabsList className="grid grid-cols-3 rounded-2xl bg-pink-50">
              {(Object.keys(slots) as SlotName[]).map((slot) => (
                <TabsTrigger key={slot} value={slot}>
                  {slotLabels[slot]}
                </TabsTrigger>
              ))}
            </TabsList>
            {(Object.keys(slots) as SlotName[]).map((slot) => (
              <TabsContent key={slot} value={slot} className="mt-4">
                {renderSlotContent(slot)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

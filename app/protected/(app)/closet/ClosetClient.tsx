"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HeraPreview } from "@/components/HeraPreview";
import { useHera } from "@/lib/context/hera";
import { useProfile } from "@/lib/context/profile";
import type { UpdateAppearancePayload, UpdateAppearanceResult } from "./actions";

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
  clothes: "洋服",
  frontHair: "前髪",
  backHair: "後ろ髪",
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
    const activeValue = selection[slot] ?? "default";

    return (
      <ScrollArea className="h-max">
        <div className="pr-2">
          <RadioGroup
            value={activeValue}
            onValueChange={(value) => handleSelect(slot, value)}
          >
            {options.map((item) => {
              const isDefaultOption =
                item.key === "default" || item.id === "default";
              const value = isDefaultOption ? "default" : item.id;
              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2"
                >
                  <RadioGroupItem value={value} />
                  <div>
                    <div className="text-sm font-medium leading-none">{item.name}</div>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
          {!items.length && (
            <p className="text-center text-xs text-muted-foreground">
              アイテムがありません。
            </p>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SlotName)}>
            <TabsList className="grid grid-cols-3 w-full">
              {(Object.keys(slots) as SlotName[]).map((slot) => (
                <TabsTrigger key={slot} value={slot}>
                  {slotLabels[slot]}
                </TabsTrigger>
              ))}
            </TabsList>
            {(Object.keys(slots) as SlotName[]).map((slot) => (
              <TabsContent key={slot} value={slot} className="mt-3 space-y-3">
                {renderSlotContent(slot)}
                <div className="flex justify-center">
                  <HeraPreview
                    appearance={previewAppearance}
                    moodKey={moodKey}
                    className="h-72 w-56"
                    sizes="220px"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

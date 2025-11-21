"use server";

import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import type { HeraAppearance } from "@/lib/context/hera";

type SlotName = "frontHair" | "backHair" | "clothes";

export type UpdateAppearancePayload = {
  frontHairItemId: string | null;
  backHairItemId: string | null;
  clothesItemId: string | null;
};

export type UpdateAppearanceResult =
  | { success: true; appearance: HeraAppearance }
  | { success: false; message: string };

const slotFieldMap: Record<SlotName, string> = {
  frontHair: "front_hair_item_id",
  backHair: "back_hair_item_id",
  clothes: "clothes_item_id",
};

export async function updateAppearance(
  payload: UpdateAppearancePayload
): Promise<UpdateAppearanceResult> {
  const supabase = await createClient();
  const { userId } = await getUserClaims();

  const normalize = (value: string | null) =>
    value && value.startsWith("default") ? null : value;

  const selectedEntries: [SlotName, string | null][] = [
    ["frontHair", normalize(payload.frontHairItemId)],
    ["backHair", normalize(payload.backHairItemId)],
    ["clothes", normalize(payload.clothesItemId)],
  ];

  const selectedIds = selectedEntries
    .map(([, value]) => value)
    .filter((value): value is string => Boolean(value));

  const { data: itemData, error: itemError } = selectedIds.length
    ? await supabase
      .from("item")
      .select("id,image_filename,slot")
      .in("id", selectedIds)
    : { data: [], error: null };

  if (itemError) {
    console.error("Failed to load items", itemError);
    return { success: false, message: "アイテム情報の取得に失敗しました" };
  }

  const itemsById = new Map(itemData?.map((item) => [item.id, item]));

  // デフォルト（image_filename === "default"）は所持確認をスキップ
  const idsToVerify = selectedIds.filter((id) => {
    const item = itemsById.get(id);
    return item ? item.image_filename !== "default" : true;
  });

  if (idsToVerify.length) {
    const { data: ownershipRows, error: ownershipError } = await supabase
      .from("user_item")
      .select("item_id")
      .eq("user_id", userId)
      .in("item_id", idsToVerify);

    if (ownershipError) {
      console.error("Failed to verify ownership", ownershipError);
      return { success: false, message: "所持状況の確認に失敗しました" };
    }

    const ownedSet = new Set(ownershipRows?.map((row) => row.item_id));
    for (const id of idsToVerify) {
      if (!ownedSet.has(id)) {
        return { success: false, message: "所持していないアイテムは装備できません" };
      }
    }
  }

  for (const [slot, value] of selectedEntries) {
    if (!value) continue;
    const item = itemsById.get(value);
    if (!item) {
      return { success: false, message: "選択したアイテム情報が見つかりません" };
    }
    if (item.slot !== slot) {
      return { success: false, message: "正しいスロットのアイテムを選択してください" };
    }
  }

  const updatePayload = selectedEntries.reduce(
    (acc, [slot, value]) => ({ ...acc, [slotFieldMap[slot]]: value }),
    {} as Record<string, string | null>
  );

  const { error: updateError } = await supabase
    .from("profile")
    .update(updatePayload)
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update profile appearance", updateError);
    return { success: false, message: "プロフィールの更新に失敗しました" };
  }

  const normalizeKey = (key: string | undefined) =>
    key ? key.replace(/\.png$/i, "") : "default";

  const buildKey = (_slot: SlotName, value: string | null) =>
    value ? normalizeKey(itemsById.get(value)?.image_filename) : "default";

  return {
    success: true,
    appearance: {
      frontHairKey: buildKey("frontHair", payload.frontHairItemId),
      backHairKey: buildKey("backHair", payload.backHairItemId),
      clothesKey: buildKey("clothes", payload.clothesItemId),
    },
  };
}

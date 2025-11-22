"use server";

import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { getPresentMessage } from "@/lib/hera/presentMessage";

type ConsumeItemSuccess = {
  success: true;
  itemId: string;
  itemName: string;
  consumedQuantity: number;
  remainingQuantity: number;
  affectionDelta: number;
  newAffection: number;
  message: string;
};

type ConsumeItemFailure = {
  success: false;
  message: string;
};

export type ConsumeItemResult = ConsumeItemSuccess | ConsumeItemFailure;

const clampAffection = (value: number) => Math.max(0, Math.min(100, value));

export async function consumeItem(
  itemId: string,
  quantity: number
): Promise<ConsumeItemResult> {
  if (!itemId) {
    return { success: false, message: "アイテムが指定されていません" };
  }
  const normalizedQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
  if (normalizedQuantity <= 0) {
    return { success: false, message: "1個以上を指定してください" };
  }

  const supabase = await createClient();
  const { userId } = await getUserClaims();

  const [{ data: profile, error: profileError }, { data: userItemRaw, error: userItemError }] =
    await Promise.all([
      supabase
        .from("profile")
        .select("affection")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("user_item")
        .select(
          "id,quantity,item_id,item:item_id!inner(id,name,category,affection_gain)"
        )
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .maybeSingle(),
    ]);

  if (profileError || !profile) {
    console.error("[Items] profile fetch failed", profileError);
    return { success: false, message: "プロフィールの取得に失敗しました" };
  }
  if (userItemError && userItemError.code !== "PGRST116") {
    console.error("[Items] user item fetch failed", userItemError);
    return { success: false, message: "アイテムの取得に失敗しました" };
  }

  type UserItemRow = {
    id: string;
    quantity: number;
    item: {
      id: string;
      name: string;
      category: string;
      affection_gain: number | null;
    } | null;
  };

  const userItem = userItemRaw as unknown as UserItemRow | null;

  if (!userItem?.item || !userItem.quantity) {
    return { success: false, message: "このアイテムは持っていません" };
  }
  if (userItem.item.category !== "consumable") {
    return { success: false, message: "消費アイテムではありません" };
  }

  const availableQuantity = userItem.quantity;
  if (normalizedQuantity > availableQuantity) {
    return {
      success: false,
      message: `所持数は${availableQuantity}個です。`,
    };
  }

  const affectionDelta =
    (userItem.item.affection_gain ?? 0) * Math.max(1, normalizedQuantity);
  const newAffection = clampAffection((profile.affection ?? 0) + affectionDelta);
  const remainingQuantity = availableQuantity - normalizedQuantity;

  const nowISO = new Date().toISOString();
  const [{ error: profileUpdateError }, { error: quantityUpdateError }] =
    await Promise.all([
      supabase
        .from("profile")
        .update({ affection: newAffection, last_active: nowISO })
        .eq("user_id", userId),
      remainingQuantity > 0
        ? supabase
          .from("user_item")
          .update({ quantity: remainingQuantity })
          .eq("id", userItem.id)
        : supabase.from("user_item").delete().eq("id", userItem.id),
    ]);

  if (profileUpdateError) {
    console.error("[Items] affection update failed", profileUpdateError);
    return { success: false, message: "好感度の更新に失敗しました" };
  }
  if (quantityUpdateError) {
    console.error("[Items] inventory update failed", quantityUpdateError);
    return { success: false, message: "アイテムの消費に失敗しました" };
  }

  const message = getPresentMessage({
    affectionAfter: newAffection,
    itemName: userItem.item.name,
    quantity: normalizedQuantity,
    affectionGain: userItem.item.affection_gain ?? 0,
  });

  return {
    success: true,
    itemId: userItem.item.id,
    itemName: userItem.item.name,
    consumedQuantity: normalizedQuantity,
    remainingQuantity,
    affectionDelta,
    newAffection,
    message,
  };
}

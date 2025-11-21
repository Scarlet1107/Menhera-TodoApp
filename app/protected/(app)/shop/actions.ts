"use server";

import { randomInt } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { applyCoinChange } from "@/lib/coins/applyCoinChange";
import { GACHA_COST } from "@/constants/gacha";

type ItemCategory = "cosmetic" | "consumable";

type GachaItem = {
  id: string;
  image_filename: string;
  name: string;
  description: string | null;
  category: ItemCategory;
  slot: "frontHair" | "backHair" | "clothes" | "none";
  gacha_weight: number;
};

type NotificationPayload = {
  id: string;
  userId: string;
  type: "coin_reward" | "item_acquired" | "system";
  content: string;
  isRead: boolean;
  createdAt: string;
};

const mapNotification = (row: {
  id: string;
  user_id: string;
  type: "coin_reward" | "item_acquired" | "system";
  content: string;
  is_read: boolean;
  created_at: string;
} | null): NotificationPayload | null =>
  row
    ? {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    }
    : null;

export type DrawGachaResult =
  | {
    success: true;
    item: {
      id: string;
      name: string;
      description: string | null;
      category: ItemCategory;
      slot: "frontHair" | "backHair" | "clothes" | "none";
    };
    newBalance: number;
    notification: NotificationPayload | null;
  }
  | {
    success: false;
    message: string;
  };

export async function drawGacha(): Promise<DrawGachaResult> {
  const supabase = await createClient();
  const { userId } = await getUserClaims();

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("menhera_coin")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch profile", profileError);
      return { success: false, message: "プロフィールの取得に失敗しました" };
    }

    const currentCoin = profile?.menhera_coin ?? 0;
    if (currentCoin < GACHA_COST) {
      return { success: false, message: "メンヘラコインが不足しています" };
    }

    const [{ data: items, error: itemsError }, { data: userItems, error: ownedError }] =
      await Promise.all([
        supabase
          .from("item")
          .select("id,name,description,category,gacha_weight,image_filename,slot")
          .gt("gacha_weight", 0),
        supabase.from("user_item").select("item_id").eq("user_id", userId),
      ]);

    if (itemsError) {
      console.error("Failed to fetch gacha items", itemsError);
      return { success: false, message: "ガチャアイテムの取得に失敗しました" };
    }
    if (ownedError) {
      console.error("Failed to fetch owned items", ownedError);
      return { success: false, message: "所持アイテムの取得に失敗しました" };
    }

    const cosmeticOwnedIds = new Set(
      (userItems ?? []).map((entry) => entry.item_id)
    );

    const candidates = (items ?? []).filter((item) => {
      if (!item || typeof item.gacha_weight !== "number") return false;
      if (item.gacha_weight <= 0) return false;
      if (item.category === "cosmetic" && cosmeticOwnedIds.has(item.id)) {
        return false;
      }
      return true;
    }) as GachaItem[];

    if (!candidates.length) {
      return {
        success: false,
        message: "現在引けるガチャ景品がありません",
      };
    }

    const totalWeight = candidates.reduce(
      (sum, item) => sum + item.gacha_weight,
      0
    );
    if (totalWeight <= 0) {
      return {
        success: false,
        message: "ガチャ景品の設定が正しくありません",
      };
    }

    const randomValue = randomInt(totalWeight);
    let cumulative = 0;
    let selected: GachaItem | null = null;
    for (const item of candidates) {
      cumulative += item.gacha_weight;
      if (randomValue < cumulative) {
        selected = item;
        break;
      }
    }
    if (!selected) {
      selected = candidates[candidates.length - 1];
    }

    const newBalance =
      (await applyCoinChange({
        supabase,
        userId,
        amount: -GACHA_COST,
        type: "gacha",
        itemId: selected.id,
        skipNotification: true,
      })) ?? currentCoin - GACHA_COST;

    const { data: existingItems, error: existingError } = await supabase
      .from("user_item")
      .select("id,quantity")
      .eq("user_id", userId)
      .eq("item_id", selected.id)
      .limit(1);

    if (existingError) {
      console.error("Failed to fetch user item", existingError);
      return {
        success: false,
        message: "アイテムの取得状態を確認できませんでした",
      };
    }

    const existingItem = existingItems?.[0];

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("user_item")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
      if (updateError) {
        console.error("Failed to update inventory", updateError);
        return { success: false, message: "アイテムの付与に失敗しました" };
      }
    } else {
      const { error: insertError } = await supabase.from("user_item").insert({
        user_id: userId,
        item_id: selected.id,
        quantity: 1,
      });
      if (insertError) {
        console.error("Failed to insert inventory item", insertError);
        return { success: false, message: "アイテムの付与に失敗しました" };
      }
    }

    const { data: notificationRow, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: "item_acquired",
        content: `ガチャで「${selected.name}」を手に入れました！`,
      })
      .select("id,user_id,type,content,is_read,created_at")
      .single();

    if (notificationError) {
      console.error("Failed to insert notification", notificationError);
    }

    const notification = mapNotification(notificationRow);

    return {
      success: true,
      item: {
        id: selected.id,
        name: selected.name,
        description: selected.description,
        category: selected.category,
        slot: selected.slot,
      },
      newBalance,
      notification,
    };
  } catch (error) {
    console.error("drawGacha failed", error);
    return {
      success: false,
      message: "ガチャ処理中にエラーが発生しました",
    };
  }
}

export type PurchaseItemResult =
  | {
    success: true;
    item: {
      id: string;
      name: string;
      price: number;
    };
    newBalance: number;
    notification: NotificationPayload | null;
  }
  | { success: false; message: string };

export async function purchaseItem(
  itemId: string
): Promise<PurchaseItemResult> {
  const supabase = await createClient();
  const { userId } = await getUserClaims();

  try {
    const [{ data: profile, error: profileError }, { data: item, error: itemError }] =
      await Promise.all([
        supabase
          .from("profile")
          .select("menhera_coin")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("item")
          .select("id,name,price,is_unique")
          .eq("id", itemId)
          .single(),
      ]);

    if (profileError || !profile) {
      console.error("Failed to fetch profile", profileError);
      return { success: false, message: "プロフィールの取得に失敗しました" };
    }
    if (itemError || !item) {
      console.error("Failed to fetch shop item", itemError);
      return { success: false, message: "アイテムの取得に失敗しました" };
    }

    if (item.price == null) {
      return { success: false, message: "このアイテムは現在販売されていません" };
    }
    if (item.price <= 0) {
      return { success: false, message: "価格設定が正しくありません" };
    }

    const currentCoin = profile.menhera_coin ?? 0;
    if (currentCoin < item.price) {
      return { success: false, message: "メンヘラコインが不足しています" };
    }

    const { data: existingItem, error: existingError } = await supabase
      .from("user_item")
      .select("id,quantity")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Failed to load inventory entry", existingError);
      return { success: false, message: "所持状況の確認に失敗しました" };
    }

    if (item.is_unique && existingItem) {
      return { success: false, message: "このアイテムはすでに購入済みです" };
    }

    const newBalance =
      (await applyCoinChange({
        supabase,
        userId,
        amount: -item.price,
        type: "shop_purchase",
        itemId: item.id,
        notificationContent: `${item.name}を購入してヘラコインを${item.price}枚消費しました`,
      })) ?? currentCoin - item.price;

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("user_item")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
      if (updateError) {
        console.error("Failed to update quantity", updateError);
        return { success: false, message: "アイテムの更新に失敗しました" };
      }
    } else {
      const { error: insertError } = await supabase.from("user_item").insert({
        user_id: userId,
        item_id: item.id,
        quantity: 1,
      });
      if (insertError) {
        console.error("Failed to insert user item", insertError);
        return { success: false, message: "アイテムの付与に失敗しました" };
      }
    }

    const { data: notificationRow, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: "item_acquired",
        content: `ショップで「${item.name}」を購入しました！`,
      })
      .select("id,user_id,type,content,is_read,created_at")
      .single();

    if (notificationError) {
      console.error("Failed to insert purchase notification", notificationError);
    }

    return {
      success: true,
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
      },
      newBalance,
      notification: mapNotification(notificationRow),
    };
  } catch (error) {
    console.error("purchaseItem failed", error);
    return { success: false, message: "購入処理中にエラーが発生しました" };
  }
}

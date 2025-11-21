import type { SupabaseClient } from "@supabase/supabase-js";

export type CoinLogType =
  | "todo_reward"
  | "anniversary"
  | "gacha"
  | "shop_purchase"
  | "manual_adjust";

export type NotificationKind = "coin_reward" | "item_acquired" | "system";

type ApplyCoinChangeParams = {
  supabase: SupabaseClient<any>;
  userId: string;
  amount: number;
  type: CoinLogType;
  todoId?: string;
  itemId?: string;
  notificationContent?: string;
  skipNotification?: boolean;
};

/**
 * Profile のキャッシュ残高に反映しつつ CoinLog と通知を追加する
 */
export const applyCoinChange = async ({
  supabase,
  userId,
  amount,
  type,
  todoId,
  itemId,
  notificationContent,
  skipNotification = false,
}: ApplyCoinChangeParams) => {
  if (amount === 0) return;

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("menhera_coin")
    .eq("user_id", userId)
    .single();

  if (profileError) throw profileError;

  const currentBalance = profileData?.menhera_coin ?? 0;
  const nextBalance = Math.max(0, currentBalance + amount);

  const { error: updateError } = await supabase
    .from("profile")
    .update({ menhera_coin: nextBalance })
    .eq("user_id", userId);

  if (updateError) throw updateError;

  const { error: logError } = await supabase.from("coin_log").insert({
    user_id: userId,
    amount,
    type,
    todo_id: todoId ?? null,
    item_id: itemId ?? null,
  });

  if (logError) throw logError;

  if (!skipNotification) {
    const defaultContent =
      amount >= 0
        ? `ヘラコインを${amount}枚獲得しました`
        : `ヘラコインを${Math.abs(amount)}枚失いました`;

    const notificationType: NotificationKind = "coin_reward";
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: notificationType,
        content: notificationContent ?? defaultContent,
      });

    if (notificationError) throw notificationError;
  }

  return nextBalance;
};

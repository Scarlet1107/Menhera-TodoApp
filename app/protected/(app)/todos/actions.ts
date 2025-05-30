// app/protected/todos/actions.ts
"use server";
import { createClient } from "@/utils/supabase/server";

/**
 * プロフィールのaffectionを増減するサーバーアクション
 */
export type UpdateAffectionFn = (
  userId: string,
  delta: number
) => Promise<void>;
export async function updateAffection(userId: string, delta: number) {
  const supabase = await createClient();
  // 現在のaffectionを取得
  const { data: profileData } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", userId)
    .single();
  const current = profileData?.affection ?? 0;
  const newAffection = Math.min(100, Math.max(0, current + delta));
  // プロフィール更新
  await supabase
    .from("profile")
    .update({ affection: newAffection, last_active: new Date().toISOString() })
    .eq("user_id", userId);
}

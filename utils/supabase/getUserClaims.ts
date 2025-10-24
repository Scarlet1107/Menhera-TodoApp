// utils/supabase/getUserClaims.ts
import { createClient } from "@/utils/supabase/server";
import { JwtPayload } from "@supabase/supabase-js";

/**
 * 認証済みユーザーのJWTクレーム情報とユーザーIDを取得する
 * 
 * @returns {Promise<{user: JwtPayload, userId: string}>} ユーザークレーム情報とユーザーID
 * 
 * @example
 * ```typescript
 * // 分割代入で使用
 * const { user, userId } = await getUserClaims();
 * ```
 * 
 * @throws {Error} 認証情報の取得に失敗した場合
 * 
 * @note サーバーコンポーネント専用 - クライアントサイドでは使用しないでください
 */
export const getUserClaims = async (): Promise<{ user: JwtPayload; userId: string }> => {
  const supabase = await createClient();
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const user = data?.claims;
  if (error || !user) {
    throw new Error("Failed to get user claims");
  }
  const userId = user.sub;

  return { user, userId };
};

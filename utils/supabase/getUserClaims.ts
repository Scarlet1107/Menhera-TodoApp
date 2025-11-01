// utils/supabase/getUserClaims.ts
import { createClient } from "@/utils/supabase/server";
import { JwtPayload } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type GetUserClaimsOptions = {
  /**
   * Should the helper redirect to the sign-in page when no claims are found.
   * API ルートなどリダイレクトできない環境では false を指定してください。
   */
  redirectOnFail?: boolean;
};

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
 * @note ログイン後のページのみで使用してください
 */
export const getUserClaims = async (
  options: GetUserClaimsOptions = {}
): Promise<{ user: JwtPayload; userId: string }> => {
  const supabase = await createClient();
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const user = data?.claims;
  if (error) {
    throw new Error("Failed to get user claims");
  }

  const shouldRedirectOnFail =
    options.redirectOnFail === undefined ? true : options.redirectOnFail;

  if (!user) {
    if (shouldRedirectOnFail) {
      redirect("/sign-in");
    }
    throw new Error("No user claims");
  }
  const userId = user.sub;

  return { user, userId };
};

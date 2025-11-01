// utils/supabase/getUserProfile.ts
import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "./getUserClaims";
import { Profile } from "@/lib/generated/prisma";

/**
 * Supabaseの`profile`テーブルからプロフィール情報を取得する。
 *
 * @param userId - 任意指定のSupabaseユーザーID。省略時は認証済みユーザーのIDをJWTクレームから取得します。
 * @returns プロフィール情報
 * @throws {Error} 認証情報またはプロフィールの取得に失敗した場合
 *
 * @example
 * ```ts
 * const profile = await getUserProfile();
 * console.log(profile.affection);
 * ```
 *
 * @example
 * ```ts
 * const profile = await getUserProfile("00000000-0000-0000-0000-000000000000");
 * console.log(profile.user_id);
 * ```
 */
export const getUserProfile = async (
    userId?: string
): Promise<Profile> => {
    const supabase = await createClient();

    const targetUserId = userId ? userId : (await getUserClaims()).userId;

    const {
        data: profileData,
        error: profileError,
    } = await supabase
        .from("profile")
        .select("user_id, name, last_seen_at, last_active, affection, mode, created_at")
        .eq("user_id", targetUserId)
        .single();

    if (profileError || !profileData) {
        throw new Error("Failed to get user profile");
    }

    const profile: Profile = {
        userId: profileData.user_id,
        name: profileData.name,
        lastSeenAt: profileData.last_seen_at ? new Date(profileData.last_seen_at) : null,
        lastActive: profileData.last_active ? new Date(profileData.last_active) : null,
        affection: profileData.affection,
        mode: profileData.mode,
        createdAt: new Date(profileData.created_at),
    };

    return profile;
};

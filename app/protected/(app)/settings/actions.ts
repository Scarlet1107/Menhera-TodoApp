"use server";

import { createClient } from "@/utils/supabase/server";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { revalidatePath } from "next/cache";

export type UpdateDisplayNameState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MAX_NAME_LENGTH = 50;

export async function updateDisplayNameAction(
  _prevState: UpdateDisplayNameState,
  formData: FormData
): Promise<UpdateDisplayNameState> {
  const displayName = formData.get("displayName")?.toString().trim();

  if (!displayName) {
    return { status: "error", message: "ユーザー名を入力してください。" };
  }

  if (displayName.length > MAX_NAME_LENGTH) {
    return {
      status: "error",
      message: `ユーザー名は${MAX_NAME_LENGTH}文字以内で入力してください。`,
    };
  }

  const supabase = await createClient();
  const { userId } = await getUserClaims();

  const { error } = await supabase
    .from("profile")
    .update({
      name: displayName,
      last_active: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update display name", error);
    return {
      status: "error",
      message: "ユーザー名の更新に失敗しました。時間を空けて再度お試しください。",
    };
  }

  revalidatePath("/protected/settings");

  return {
    status: "success",
    message: "ユーザー名を更新しました。",
  };
}

// utils/supabase/getAuthUser.ts
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export const getAuthUser = async (): Promise<User> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("ログインユーザーが取得できません");
  }

  return user;
};

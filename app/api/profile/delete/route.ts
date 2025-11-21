// app/api/profile/delete/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getUserClaims } from "@/utils/supabase/getUserClaims";

export async function DELETE() {
  // 認証チェック
  const authClient = await createClient();
  let userId: string;
  try {
    ({ userId } = await getUserClaims({ redirectOnFail: false }));
  } catch {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  // RLS バイパスして削除
  await authClient.from("todo").delete().eq("user_id", userId);
  await authClient.from("profile").delete().eq("user_id", userId);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await authClient.auth.signOut();

  return NextResponse.json({ success: true });
}

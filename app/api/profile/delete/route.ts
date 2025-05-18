// app/api/profile/delete/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function DELETE() {
  // 認証チェック
  const authClient = await createClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }
  const userId = user.id;

  // RLS バイパスして削除
  const todoDeleteRes = await authClient.from("todo").delete().eq("user_id", userId);
  console.log("todo delete res =", todoDeleteRes);

  const profileDeleteRes = await authClient.from("profile").delete().eq("user_id", userId);
  console.log("profile delete res =", profileDeleteRes);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// app/api/profile/delete/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // サーバー側Supabaseクライアント（service_roleキー使用）
  const supabase = await createClient();

  // 現在のユーザー取得
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }
  const userId = user.id;

  // 1) Todoを削除（Profile削除時にcascadeされるが、明示的に）
  await supabase.from("todo").delete().eq("user_id", userId);
  // 2) Profileを削除
  await supabase.from("profile").delete().eq("user_id", userId);
  // 3) Authユーザーを削除
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

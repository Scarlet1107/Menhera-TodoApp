// File: app/api/profile/delete/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  // 認証用クライアントで Cookie セッションを読み込む
  const authClient = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }
  const userId = user.id;

  // Service Role キーの管理者クライアントで RLS をバイパスして削除
  await supabaseAdmin.from("todo").delete().eq("user_id", userId);
  await supabaseAdmin.from("profile").delete().eq("user_id", userId);

  // Auth ユーザー削除
  const { error: deleteError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

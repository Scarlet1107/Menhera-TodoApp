// File: app/protected/bad-end/page.tsx
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/utils/supabase/admin";
import BadEndClient from "../../../components/deleteAccountDialog";
import { createClient } from "@/utils/supabase/server";

export default async function BadEndPage() {
  // サーバーコンポーネントで認証チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userId = user.id;

  // サーバーアクション: Service Roleキーで削除
  async function handleDelete() {
    "use server";
    await supabaseAdmin.from("todo").delete().eq("user_id", userId);
    await supabaseAdmin.from("profile").delete().eq("user_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
  }

  return <BadEndClient action={handleDelete} />;
}

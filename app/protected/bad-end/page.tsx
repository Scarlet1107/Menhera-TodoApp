// File: app/protected/bad-end/page.tsx
import { redirect } from "next/navigation";
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

  const { data, error } = await supabase
    .from("profile")
    .select("affection")
    .eq("user_id", userId);
  if (error || !data || data.length === 0) {
    redirect("/protected/home");
  }
  const affection = data[0].affection;
  if (affection > 0) {
    redirect("/protected/home");
  }

  return <BadEndClient userId={user.id} />;
}

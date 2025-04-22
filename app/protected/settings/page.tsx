import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_USER_NAME } from "@/constants/default";
import { formatToJST } from "@/utils/date";
import { getAuthUser } from "@/utils/supabase/getAuthUser";
import { createClient } from "@/utils/supabase/server";
import React from "react";

const SettingsPage = async () => {
  const user = await getAuthUser();
  const displayName = user.user_metadata?.display_name ?? DEFAULT_USER_NAME;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("userId", user.id)
    .single();

  return (
    <div>
      <h1>ログアウトだったり、色々アカウント設定ができるぞ</h1>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          ログアウト
        </Button>
      </form>
      {/* いつか実装する。いつか */}
      <div>
        <Label>お名前を変更</Label>
        <Input placeholder="未実装" />
        <Button disabled>変更</Button>
      </div>
      <div>君の名前 {displayName} さん</div>
      {profile?.lastSeenAt && (
        <div>
          君が最後にログインした日本時間はこれだ！
          {formatToJST(profile?.lastSeenAt)}
        </div>
      )}
      <p>※ただしまだ更新機能はない模様</p>
    </div>
  );
};

export default SettingsPage;

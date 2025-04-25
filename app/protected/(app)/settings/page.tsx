// app/protected/settings/page.tsx (Server Component)
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getAuthUser } from "@/utils/supabase/getAuthUser";
import { DEFAULT_USER_NAME } from "@/constants/default";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutDialog from "@/components/logoutDialog";
import dayjs from "dayjs";

const SettingsPage = async () => {
  const user = await getAuthUser();
  const displayName = user.user_metadata?.display_name ?? DEFAULT_USER_NAME;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("last_seen_at")
    .eq("user_id", user.id)
    .single();
  console.log("profile last seen at", profile?.last_seen_at);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">ユーザー名</Label>
            <Input id="displayName" value={displayName} readOnly />
          </div>
          {profile?.last_seen_at && (
            <div>
              <Label>最終ログイン</Label>
              <p className="text-sm text-gray-600">
                {(() => {
                  const jst = dayjs.utc(profile.last_seen_at).tz("Asia/Tokyo");
                  return jst.format("YYYY/MM/DD HH:mm");
                })()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {/* ログアウト確認ダイアログ */}
          <LogoutDialog />

          {/* パスワードリセット */}
          <Link href="/protected/reset-password" className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
            >
              <Key className="mr-2" /> パスワードをリセット
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;

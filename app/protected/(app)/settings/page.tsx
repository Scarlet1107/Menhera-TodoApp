// app/protected/settings/page.tsx (Server Component)
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutDialog from "@/components/logoutDialog";
import dayjs from "dayjs";
import { getUserProfile } from "@/utils/supabase/getUserProfile";
import { DEFAULT_USER_NAME } from "@/constants/default";
import { UpdateDisplayNameForm } from "@/components/updateDisplayNameForm";
import { Label } from "@/components/ui/label";

const SettingsPage = async () => {
  const profile = await getUserProfile();

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UpdateDisplayNameForm
            initialName={profile.name ?? DEFAULT_USER_NAME}
          />
          {profile?.lastSeenAt && (
            <div>
              <Label>最終ログイン</Label>
              <p className="text-sm text-gray-600">
                {(() => {
                  const jst = dayjs.utc(profile.lastSeenAt).tz("Asia/Tokyo");
                  return jst.format("YYYY/MM/DD HH:mm");
                })()}
              </p>
            </div>
          )}
          {/* {profile?.difficulty && (
            <DifficultySwitch initial={profile.difficulty} />
          )} */}
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

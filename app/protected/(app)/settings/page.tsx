// app/protected/settings/page.tsx (Server Component)
import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DarkModeToggle } from "@/components/darkModeToggle";

const SettingsPage = () => {
  return (
    <div className="p-4 max-w-md mx-auto mb-24 md:mb-0">
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
          </CardHeader>
          <Suspense fallback={<AccountInfoSkeleton />}>
            <AccountInfo />
          </Suspense>
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
    </div>
  );
};

async function AccountInfo() {
  const profile = await getUserProfile();

  return (
    <CardContent className="space-y-4">
      <UpdateDisplayNameForm
        initialName={profile.name ?? DEFAULT_USER_NAME}
      />
      <DarkModeToggle />
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
    </CardContent>
  );
}

function AccountInfoSkeleton() {
  return (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="space-y-2">
          <Label>ユーザー名</Label>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="w-full flex items-center justify-between rounded-md border px-3 py-2">
        <div className="flex-1">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
      <div className="space-y-1">
        <Label>最終ログイン</Label>
        <Skeleton className="h-4 w-40" />
      </div>
    </CardContent>
  );
}

export default SettingsPage;

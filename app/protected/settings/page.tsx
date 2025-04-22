import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

const SettingsPage = () => {
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
        <Input />
        <Button>変更</Button>
      </div>
    </div>
  );
};

export default SettingsPage;

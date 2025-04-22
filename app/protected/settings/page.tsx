import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
    </div>
  );
};

export default SettingsPage;

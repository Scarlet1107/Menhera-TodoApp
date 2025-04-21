import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { User } from "@supabase/supabase-js";
import { ThemeSwitcher } from "./theme-switcher";

export default async function HeaderAuth({ user }: { user: User | null }) {
  return user ? (
    <div className="flex items-center gap-4 text-sm">
      <ThemeSwitcher />
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          ログアウト
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2 text-sm">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">新規登録</Link>
      </Button>
    </div>
  );
}

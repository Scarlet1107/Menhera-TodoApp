"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { User } from "@supabase/supabase-js";
import { Home, Settings, ShoppingBag, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  user: User | null;
};

const tabs = [
  {
    href: "/protected/home",
    icon: <Home className="w-4 h-4" />,
    label: "ホーム",
  },
  {
    href: "/protected/todos",
    icon: <ListTodo className="w-4 h-4" />,
    label: "Todos",
  },
  {
    href: "/protected/shop",
    icon: <ShoppingBag className="w-4 h-4" />,
    label: "ショップ",
  },
  {
    href: "/protected/settings",
    icon: <Settings className="w-4 h-4" />,
    label: "設定",
  },
];

export default function Header({ user }: Props) {
  const pathname = usePathname();

  return (
    <header className="w-full border-b bg-pink-50 dark:bg-zinc-900 border-pink-200 dark:border-zinc-800 px-4 shadow-sm h-14 flex items-center justify-between">
      {/* 左側：ロゴやアプリ名 */}
      <Link href="/protected/home" className="text-sm font-bold text-pink-600">
        メンヘラTodo
      </Link>

      {/* 右側：内容はログイン状態と画面幅で変わる */}
      {user ? (
        <>
          {/* PC：Shadcn風ナビゲーション */}
          <nav className="hidden sm:flex gap-4 ml-8">
            {tabs.map(({ href, icon, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1 text-sm px-2 py-1.5 rounded-md transition-colors",
                    isActive
                      ? "bg-pink-100 text-pink-600"
                      : "text-gray-500 hover:bg-pink-100 hover:text-pink-600"
                  )}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 共通：ThemeSwitcher（右端） */}
          <div className="flex items-center gap-4 ml-auto text-sm">
            <ThemeSwitcher />
          </div>
        </>
      ) : (
        <div className="flex gap-2 text-sm ml-auto">
          <Button asChild size="sm" variant="outline">
            <Link href="/sign-in">ログイン</Link>
          </Button>
          <Button asChild size="sm" variant="default">
            <Link href="/sign-up">新規登録</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

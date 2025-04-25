"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { User } from "@supabase/supabase-js";
import {
  Home,
  Settings,
  ShoppingBag,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  user: User | null;
  isHard: boolean;
};

export default function Header({ user, isHard }: Props) {
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
  const pathname = usePathname();
  if (isHard) {
    tabs.push({
      href: "/protected/chat",
      icon: <MessageSquare className="w-4 h-4" />,
      label: "チャット",
    });
  }

  return (
    <header className="w-full border-b bg-pink-50/80 dark:bg-stone-800/80 border-pink-200 dark:border-stone-900 px-4 shadow-sm h-14 flex items-center justify-between">
      <Link href="/">
        <Image
          src="/header-icon.png"
          height={150}
          width={180}
          alt="Header-Icon"
        />
      </Link>

      {user && (
        <>
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
        </>
      )}
      <div className="flex items-center gap-4 ml-auto text-sm">
        <ThemeSwitcher />
      </div>
    </header>
  );
}

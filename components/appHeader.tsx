"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JwtPayload } from "@supabase/supabase-js";
import {
  Home,
  Settings,
  ShoppingBag,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { NotificationPopover } from "./NotificationPopover";


export default function AppHeader() {
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

  return (
    <header className="w-full border-b bg-pink-50/80 dark:bg-stone-700/80 border-pink-200 dark:border-stone-900 px-4 shadow-sm h-14 flex items-center justify-between sm:py-8">
      <Link href="/protected/home">
        <Image
          src="/header-icon.png"
          height={150}
          width={180}
          alt="Header-Icon"
        />
      </Link>

      <nav className="hidden sm:flex gap-4 ml-auto pl-8">
        {tabs.map(({ href, icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1 text-sm px-2 py-1.5 rounded-md transition-colors ",
                isActive
                  ? "text-pink-500 dark:text-pink-400 font-semibold bg-white"
                  : "dark:text-white text-gray-600 hover:dark:bg-white hover:dark:text-pink-500"
              )}
            >
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <NotificationPopover />
    </header>
  );
}

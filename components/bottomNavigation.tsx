"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings, ShoppingBag, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/protected/home", icon: Home, label: "ホーム" },
  { href: "/protected/todos", icon: ListTodo, label: "Todos" },
  { href: "/protected/shop", icon: ShoppingBag, label: "ショップ" },
  { href: "/protected/settings", icon: Settings, label: "設定" },
];

// サーバーコンポーネントで実装したかった;;
// サーバーコンポーネントだとisActiveがうまく動かない
export const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-md sm:hidden">
      <ul className="flex justify-around items-center py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link href={href}>
                <div className="flex flex-col items-center text-xs">
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-1",
                      isActive ? "text-pink-500" : "text-gray-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px]",
                      isActive ? "text-pink-500 font-semibold" : "text-gray-500"
                    )}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

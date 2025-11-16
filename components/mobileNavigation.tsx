"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type Tab } from "@/constants/navigationTabs";
import {
  buildSizeStyle,
  buildWidthStyle,
  type SizeConfig,
  type SizeValue,
} from "./navigationSizing";

interface MobileNavigationProps {
  tabs: Tab[];
  navWidth?: SizeValue;
  itemSize?: SizeConfig;
  iconSize?: SizeConfig;
}

export const MobileNavigation = ({
  tabs,
  navWidth,
  itemSize,
  iconSize = { width: 20, height: 20 },
}: MobileNavigationProps) => {
  const pathname = usePathname();
  const navStyle = buildWidthStyle(navWidth);
  const itemStyle = buildSizeStyle(itemSize);
  const iconStyle = buildSizeStyle(iconSize);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-pink-50/70 border-pink-200 dark:bg-white/50 border-t dark:border-gray-200 shadow-md sm:hidden"
      style={navStyle}
    >
      <ul className="flex justify-around items-center p-2 ">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link href={href}>
                <div
                  className="flex flex-col items-center text-xs rounded-full bg-white aspect-square w-13 h-13 justify-center hover:bg-pink-50 transition-all duration-200 ease-in-out"
                  style={itemStyle}
                >
                  <Icon
                    className={cn(
                      "mb-0.5",
                      isActive ? "text-pink-500" : "text-gray-500"
                    )}
                    style={iconStyle}
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

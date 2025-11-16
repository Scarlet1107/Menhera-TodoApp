"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { NotificationPopover } from "./NotificationPopover";
import { MobileNavigation } from "./mobileNavigation";
import { sharedTabs, type Tab } from "@/constants/navigationTabs";
import {
  buildSizeStyle,
  buildWidthStyle,
  type SizeConfig,
  type SizeValue,
} from "./navigationSizing";

interface AppHeaderProps {
  tabs?: Tab[];
  navWidth?: SizeValue;
  iconSize?: SizeConfig;
  mobileNavWidth?: SizeValue;
  mobileTabSize?: SizeConfig;
  mobileIconSize?: SizeConfig;
}

export default function AppHeader({
  tabs = sharedTabs,
  navWidth,
  iconSize = { width: 16, height: 16 },
  mobileNavWidth,
  mobileTabSize,
  mobileIconSize,
}: AppHeaderProps) {
  const pathname = usePathname();
  const navStyle = buildWidthStyle(navWidth);
  const iconStyle = buildSizeStyle(iconSize);

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

      <nav className="hidden sm:flex gap-4 ml-auto pl-8" style={navStyle}>
        {tabs.map(({ href, icon: Icon, label }) => {
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
              <Icon className="shrink-0" style={iconStyle} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <MobileNavigation
        tabs={tabs}
        navWidth={mobileNavWidth}
        itemSize={mobileTabSize}
        iconSize={mobileIconSize}
      />
      <NotificationPopover />
    </header>
  );
}

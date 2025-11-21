import {
  Home,
  ListTodo,
  Settings,
  ShoppingBag,
  LucideIcon,
  Shirt,
} from "lucide-react";

export interface Tab {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const sharedTabs: Tab[] = [
  {
    href: "/protected/home",
    icon: Home,
    label: "ホーム",
  },
  {
    href: "/protected/todos",
    icon: ListTodo,
    label: "Todos",
  },
  {
    href: "/protected/shop",
    icon: ShoppingBag,
    label: "ショップ",
  },
  {
    href: "/protected/closet",
    icon: Shirt,
    label: "着せ替え",
  },
  {
    href: "/protected/settings",
    icon: Settings,
    label: "設定",
  },
];

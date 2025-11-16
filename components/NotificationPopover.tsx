"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { formatRelativeTime } from "@/lib/time";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/lib/context/notification";

export const NotificationPopover = () => {
  const [open, setOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const { notifications, setNotifications } = useNotification();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ポップオーバー開閉監視: 開いたら未読を既読化
  useEffect(() => {
    if (!open || !notifications.length) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;

    const markRead = async () => {
      const idsToMark = unread.map((n) => n.id);
      try {
        const { error: updateError } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .in("id", idsToMark);
        if (updateError) throw updateError;

        // setNotificationsを使用して既読状態を更新
        setNotifications(prev =>
          prev.map(n =>
            idsToMark.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        router.refresh();
      } catch (err) {
        console.error("通知の既読更新に失敗しました", err);
      }
    };
    markRead();
  }, [open, notifications, supabase, setNotifications, router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative cursor-pointer md:ml-3">
          <Bell className="m-0 h-6 w-6 p-0 text-pink-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 rounded-full bg-pink-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-2 w-64 rounded-2xl p-0">
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">通知</CardTitle>
          </CardHeader>
          <Separator className="bg-pink-200 -my-2" />
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <ul>
                {notifications.length === 0 && (
                  <li className="p-4 text-center text-sm text-pink-500">
                    通知はありません
                  </li>
                )}
                {notifications.map((note) => (
                  <li
                    key={note.id}
                    className={`flex cursor-pointer flex-col border-b border-pink-200 p-4 last:border-none hover:bg-pink-50 ${!note.isRead ? "bg-pink-100 font-semibold" : ""
                      }`}
                  >
                    <span className="text-sm whitespace-pre-wrap text-pink-800">
                      {note.content}
                    </span>
                    <time className="mt-1 text-xs text-pink-500">
                      {formatRelativeTime(note.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

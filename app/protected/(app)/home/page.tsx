import React from "react";
import HeraMessage from "@/components/heraMessage";
import { AffectionBadge } from "@/components/affectionBadge";
import { useHera } from "@/lib/hera/context";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import { createClient } from "@/utils/supabase/server";
import Debugger from "@/components/debugger";

const HomePage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="p-4 text-red-500">エラー: ユーザーが見つかりません</div>
    );
  }
  const userId = user.id;

  return (
    <div className="px-4 w-full">
      {/* ヘラちゃんのメッセージ部分 */}
      <HeraMessage />

      <AffectionBadge />
      <CreateTodoDialog userId={userId} />
      {/* いずれ消す */}
      <Debugger />
    </div>
  );
};

export default HomePage;

import React from "react";
import HeraMessage from "@/components/heraMessage";
import { AffectionBadge } from "@/components/affectionBadge";
import { useHera } from "@/lib/hera/context";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import { createClient } from "@/utils/supabase/server";
import Debugger from "@/components/debugger";
import HeraMainImage from "@/components/heraMainImage";

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
    <div className="relative w-full h-64">
      {/* ヘラちゃんのメッセージ部分 */}
      <div className="mx-4">
        <HeraMessage />
      </div>
      <div className="fixed right-4 bottom-40 md:bottom-56 md:right-20">
        <AffectionBadge />
      </div>
      <HeraMainImage />
      <CreateTodoDialog userId={userId} />
      {/* いずれ消す */}
      {/* <Debugger /> */}
    </div>
  );
};

export default HomePage;

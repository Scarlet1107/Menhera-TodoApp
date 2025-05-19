import React from "react";
import HeraMessage from "@/components/heraMessage";
import { AffectionBadge } from "@/components/affectionBadge";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import { createClient } from "@/utils/supabase/server";
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

  const { data: profile } = await supabase
    .from("profile")
    .select("difficulty")
    .eq("user_id", user.id)
    .single();
  const userId = user.id;
  const isHard = profile?.difficulty === "hard";

  return (
    <div className="relative w-full h-full flex-1">
      {/* ヘラちゃんのメッセージ部分 */}
      <div className="mx-4">
        <HeraMessage />
      </div>
      <div className="fixed right-4 bottom-40 md:bottom-56 md:right-20">
        <AffectionBadge />
      </div>
      <HeraMainImage />
      {!isHard && <CreateTodoDialog userId={userId} />}
      {/* いずれ消す */}
      {/* <Debugger /> */}
    </div>
  );
};

export default HomePage;

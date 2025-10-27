import React from "react";
import HeraMessage from "@/components/heraMessage";
import { AffectionBadge } from "@/components/affectionBadge";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import { createClient } from "@/utils/supabase/server";
import HeraMainImage from "@/components/heraMainImage";
import { getUserClaims } from "@/utils/supabase/getUserClaims";

const HomePage = async () => {
  const supabase = await createClient();
  const { userId } = await getUserClaims();

  const { data: profile } = await supabase
    .from("profile")
    .select("difficulty")
    .eq("user_id", userId)
    .single();
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

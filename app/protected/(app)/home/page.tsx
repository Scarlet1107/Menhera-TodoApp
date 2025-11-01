import HeraMessage from "@/components/heraMessage";
import { AffectionBadge } from "@/components/affectionBadge";
import { CreateTodoDialog } from "@/components/createTodoDialog";
import HeraMainImage from "@/components/heraMainImage";
import { getUserClaims } from "@/utils/supabase/getUserClaims";

const HomePage = async () => {
  const { userId } = await getUserClaims();

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
      <CreateTodoDialog userId={userId} />
      {/* いずれ消す */}
      {/* <Debugger /> */}
    </div>
  );
};

export default HomePage;

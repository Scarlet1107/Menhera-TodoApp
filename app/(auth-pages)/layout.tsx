import LPHeader from "@/components/lpHeader";
import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // もしすでにログイン済みの場合、ログイン後のページにリダイレクトする
  let isAuthenticated = false;
  try {
    const { user } = await getUserClaims({ redirectOnFail: false });
    isAuthenticated = Boolean(user);
  } catch {
    // 未ログインの場合はそのままページを表示する
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    redirect("/protected/home");
  }

  return (
    <>
      <LPHeader />
      <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
    </>
  );
}

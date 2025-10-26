import { getUserClaims } from "@/utils/supabase/getUserClaims";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // // Check if the user is already logged in
  // const { user } = await getUserClaims();
  // if (user) {
  //   redirect("/protected/home");
  // }
  return (
    <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}

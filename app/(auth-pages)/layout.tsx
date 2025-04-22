import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/protected/home");
  }
  return (
    <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}

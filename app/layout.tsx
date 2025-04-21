import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { BottomNavigation } from "@/components/bottomNavigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Footer from "@/components/footer";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "メンヘラTodoアプリ",
  description:
    "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="font-semibold text-lg">
                    <Link href={"/"}>メンヘラTodo</Link>
                  </div>
                  <HeaderAuth user={user} />
                </div>
              </nav>

              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>
            </div>
            <Footer />
          </main>
          {user && <BottomNavigation />}
        </ThemeProvider>
      </body>
    </html>
  );
}

import HeaderAuth from "@/components/header-auth";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Footer from "@/components/footer";
import { MobileNavigation } from "@/components/mobileNavigation";
import { Toaster } from "@/components/ui/sonner";

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
            <div className="w-full h-14 bg-white shadow-sm flex items-center justify-end mb-4">
              <HeaderAuth user={user} />
            </div>
            {children}
            <Footer />
          </main>
          {user && <MobileNavigation />}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

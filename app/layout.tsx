import HeaderAuth from "@/components/header-auth";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { MobileNavigation } from "@/components/mobileNavigation";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

import { Metadata, Viewport } from "next";

// スマホで画面の拡大を防ぐ
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "メンヘラTodoアプリ",
  description:
    "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
  openGraph: {
    title: "メンヘラTodoアプリ",
    description:
      "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
    url: "https://menhera-todo.scarlet7.net/opengraph.png",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "メンヘラTodoアプnリ Ope Graph 画像",
      },
    ],
    siteName: "メンヘラTodoアプリ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "メンヘラTodoアプリ",
    description:
      "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
    images: ["/opengraph.png"],
  },
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

  const { data } = await supabase
    .from("profile")
    .select("difficulty")
    .eq("user_id", user?.id)
    .single();

  const isHard: boolean = data?.difficulty === "hard";

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
            <div className="w-full h-14shadow-sm flex items-center justify-end">
              <HeaderAuth user={user} isHard={isHard} />
            </div>
            {children}
          </main>
          {user && <MobileNavigation isHard={isHard} />}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

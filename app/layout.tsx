import HeaderAuth from "@/components/header-auth";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { MobileNavigation } from "@/components/mobileNavigation";
import { Toaster } from "@/components/ui/sonner";
import type { JwtPayload } from "@supabase/supabase-js";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

import { Metadata, Viewport } from "next";
import { getUserClaims } from "@/utils/supabase/getUserClaims";

// スマホで画面の拡大を防ぐ
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "メンヘラTodo",
  description:
    "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
  metadataBase: new URL("https://menhera-todo.scarlet7.net"),
  openGraph: {
    title: "メンヘラTodo",
    description:
      "めんどくさくて続かないTodoアプリ、ヘラちゃんと一緒にがんばりませんか?",
    url: "https://menhera-todo.scarlet7.net/",
    images: [
      {
        url: "https://menhera-todo.scarlet7.net/opengraph.png",
        width: 1200,
        height: 630,
        alt: "メンヘラTodoアプリ Open Graph 画像",
      },
    ],
    siteName: "メンヘラTodo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "メンヘラTodo",
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

  let user: JwtPayload | null = null;
  try {
    ({ user } = await getUserClaims({ redirectOnFail: false }));
  } catch {
    user = null;
  }

  // const { data } = await supabase
  //   .from("profile")
  //   .select("difficulty")
  //   .eq("user_id", user?.id)
  //   .single();

  // const isHard: boolean = data?.difficulty === "hard";

  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system" enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="relative z-50 w-full h-14 shadow-sm flex items-center justify-end">
              <HeaderAuth user={user} />
            </div>
            {children}
          </main>
          {user && <MobileNavigation />}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

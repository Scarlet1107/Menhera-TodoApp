import HeaderAuth from "@/components/appHeader";
import { Geist } from "next/font/google";
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
import { cookies } from "next/headers";
import { AppMode, DEFAULT_MODE, MODE_COOKIE_NAME } from "@/constants/mode";
import { AppModeProvider } from "@/components/appModeProvider";

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
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get(MODE_COOKIE_NAME)?.value as AppMode | undefined;
  const initialMode: AppMode =
    cookieMode === "dark" || cookieMode === "normal" ? cookieMode : DEFAULT_MODE;

  let user: JwtPayload | null = null;
  let userId: string | null = null;
  try {
    const result = await getUserClaims({ redirectOnFail: false });
    user = result.user;
    userId = result.userId;
  } catch {
    user = null;
    userId = null;
  }
  return (
    <html
      lang="ja"
      className={`${geistSans.className} ${initialMode === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
      </head>
      <body className="bg-background text-foreground">
        <AppModeProvider initialMode={initialMode} userId={userId}>
          <main className="min-h-screen flex flex-col items-center">
            {children}
          </main>
          <Toaster />
        </AppModeProvider>
      </body>
    </html>
  );
}

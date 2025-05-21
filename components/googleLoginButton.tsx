// components/GoogleLoginButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { ChromeIcon as LucideGoogle } from "lucide-react"


export default function GoogleLoginButton() {
    const supabase = createClientComponentClient();

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + "/protected/home", // 認証後のリダイレクト先
            },
        });
        if (error) {
            console.error("Google OAuth エラー:", error.message);
            // 必要ならトースト表示など
        } else {
            // リダイレクトでダッシュボードへ飛ぶので、ここでは特に何もしなくて OK
        }
    };

    return (
        <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className={`mt-6 w-full flex items-center justify-center gap-2 `}
        >
            <LucideGoogle size={18} />
            <span>Google でログイン</span>
        </Button>
    );
}

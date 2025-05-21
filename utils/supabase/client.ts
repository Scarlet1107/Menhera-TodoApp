// utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,    // セッション情報を localStorage + Cookie に永続化
        autoRefreshToken: true,  // Access Token の有効期限切れ時に自動でリフレッシュ
      },
    }
  );

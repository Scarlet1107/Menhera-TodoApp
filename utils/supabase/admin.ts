// File: utils/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Service Role Key を使う管理者クライアント
 * 環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Supabase プロジェクト URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role Key
  {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

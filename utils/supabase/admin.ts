// utils/supabase/admin.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * サービスロールキーを使ってRLSをバイパスする管理用クライアント
 */
export function createAdminClient() {
  if (!adminClient) {
    adminClient = createSupabaseClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return adminClient;
}

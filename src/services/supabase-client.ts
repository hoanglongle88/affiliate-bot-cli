import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "your_supabase_project_url" ||
  supabaseAnonKey === "your_supabase_anon_key"
) {
  console.error("❌ Supabase chưa được cấu hình!");
  console.error(
    "   Vui lòng cập nhật SUPABASE_URL và SUPABASE_ANON_KEY trong .env",
  );
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  return true;
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

// Guard: only create client when env vars are present
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key-for-build")

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          role: string
          experience: string
          location: string
          linkedin: string
          skills: string[]
          resume_text: string
          summary: string
          education: string
          key_achievements: string[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">>
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          job_title: string
          company: string
          final_score: number
          job_description: string
          resume_text: string
          result: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["analyses"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>
      }
    }
  }
}

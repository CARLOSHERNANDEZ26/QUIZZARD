import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nhmyghgcjzbtesdvhdxb.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXlnaGdjanpidGVzZHZoZHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTY2OTgsImV4cCI6MjA5MzAzMjY5OH0.anCxPtRh8RRRoyc0PWGvnQseeszR1OJ-H4i8uW9VQLo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Use env variable
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY; // Use env variable

export const supabase = createClient(supabaseUrl, supabaseKey);

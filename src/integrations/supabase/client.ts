// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pohnhzxqorelllbfnqyj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaG5oenhxb3JlbGxsYmZucXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Njk1MzAsImV4cCI6MjA1MzE0NTUzMH0.nG7V_e8Izqi-pXHw1HoaYAC4hediI0D9l_Qf9De93C0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// These will be populated when connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

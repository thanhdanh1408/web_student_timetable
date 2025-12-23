import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real production app, use environment variables.
// For this demo, we assume the user will set these in their environment or replace strings.
const supabaseUrl = process.env.SUPABASE_URL || 'https://xlookifyvbbafcnsizuk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_tGCFSJzTAKGX8TWbgT-GgQ_S9_7uDme';

export const supabase = createClient(supabaseUrl, supabaseKey);
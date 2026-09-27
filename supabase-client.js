// supabase-client.js

// 1. Project Base URL
const SUPABASE_URL = 'https://dsbhtlkdorlvfaefsszo.supabase.co';

// 2. Publishable Key
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aDBYNNJm650QDcrIEKBiCQ_T8Y_wQpZ';

// 3. Supabase Client Init (window. _supabase par attach kiya)
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = window._supabase; // Backup reference
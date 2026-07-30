const { createClient } = require('@supabase/supabase-js');

// Service-role client — bypasses RLS. Server-side use only, never expose to browser.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

module.exports = { getSupabaseAdmin };

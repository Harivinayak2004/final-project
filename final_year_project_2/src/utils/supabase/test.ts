// src/utils/supabase/test.ts
import { supabase } from './client'  // <-- adjust path to match client.ts location

async function testSupabase() {
  try {
    // If you want to test auth, you can list users only if you created a 'profiles' table
    // For example, let's create/select from a 'profiles' table
    const { data, error } = await supabase.from('profiles').select('*')

    if (error) {
      console.error('Supabase test failed:', error)
    } else {
      console.log('Supabase test success:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testSupabase()
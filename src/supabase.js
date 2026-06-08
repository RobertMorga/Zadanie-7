import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amgthhavysdqgujsutgf.supabase.co'
const supabaseKey = 'sb_publishable_GQ6V87tqNbn6c0sG6ExF5w_bn2THAbI'

export const supabase = createClient(supabaseUrl, supabaseKey)
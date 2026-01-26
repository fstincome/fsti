import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://livhcxrbeumwgizewkwi.supabase.co';
const supabaseKey = 'sb_publishable_FeHWOvz_NXoDCXneJY5NJw_rUSH55XV'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
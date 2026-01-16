import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', url);
console.log('Key:', key ? key.substring(0, 20) + '...' : 'NOT SET');

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    console.log('\nTesting SELECT...');
    const { data, error } = await supabase.from('races').select('id, name').limit(3);

    if (error) {
      console.error('Supabase Error:', error.message);
    } else {
      console.log('Success! Found', data?.length, 'races');
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.error('Exception:', e.message);
  }
}

test();

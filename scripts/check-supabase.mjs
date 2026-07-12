import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY。')

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await supabase
  .from('contents')
  .select('id,title,status')
  .eq('status', 'published')

if (error) throw error

console.log(JSON.stringify({
  connected: true,
  publishedItems: data.length,
  titles: data.map((item) => item.title),
}, null, 2))

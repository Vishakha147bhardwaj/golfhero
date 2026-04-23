import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('charities').select('*').eq('active',true).order('featured',{ascending:false}).order('name');
  if (error) return NextResponse.json({ error:error.message },{ status:500 });
  return NextResponse.json({ data });
}
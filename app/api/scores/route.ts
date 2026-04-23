import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
 
export async function GET() {
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const { data, error } = await supabase.from('golf_scores').select('*').eq('user_id',user.id).order('score_date',{ascending:false});
  if (error) return NextResponse.json({ error:error.message },{ status:500 });
  return NextResponse.json({ data });
}
 
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'Unauthorized' },{ status:401 });
  const { score, score_date } = await req.json();
  if (!score||score<1||score>45) return NextResponse.json({ error:'Score must be 1-45' },{ status:400 });
  if (!score_date) return NextResponse.json({ error:'Date required' },{ status:400 });
  // Check duplicate date
  const { data:existing } = await supabase.from('golf_scores').select('id').eq('user_id',user.id).eq('score_date',score_date);
  if (existing&&existing.length>0) return NextResponse.json({ error:'Score for this date already exists' },{ status:409 });
  // Rolling 5
  const { data:current } = await supabase.from('golf_scores').select('*').eq('user_id',user.id).order('score_date',{ascending:true});
  if (current&&current.length>=5) await supabase.from('golf_scores').delete().eq('id',current[0].id);
  const { data, error } = await supabase.from('golf_scores').insert({ user_id:user.id, score:parseInt(score), score_date }).select().single();
  if (error) return NextResponse.json({ error:error.message },{ status:500 });
  return NextResponse.json({ data },{ status:201 });
}
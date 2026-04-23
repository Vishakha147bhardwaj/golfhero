import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateRandomDraw, generateAlgorithmicDraw } from '@/lib/draw-engine';

// ✅ reusable types
type ScoreRow = {
  score: number;
};

type DrawType = 'random' | 'algorithmic';

type CreateDrawBody = {
  month: string;
  draw_type: DrawType;
  total_pool?: number;
  publish?: boolean;
};

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('month', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // ✅ Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ✅ Typed body
  const body: CreateDrawBody = await req.json();
  const { month, draw_type, total_pool = 0, publish = false } = body;

  // ✅ Generate draw
  let result;

  if (draw_type === 'algorithmic') {
    const { data: scores } = await supabase
      .from('golf_scores')
      .select('score');

    const typedScores: ScoreRow[] = scores ?? [];

    result = generateAlgorithmicDraw(
      typedScores.map((s) => s.score)
    );
  } else {
    result = generateRandomDraw();
  }

  // ✅ Convert to cents
  const pool = total_pool * 100;

  // ✅ Insert draw
  const { data, error } = await supabase
    .from('draws')
    .insert({
      month,
      draw_type,
      winning_numbers: result.winningNumbers,
      status: publish ? 'published' : 'simulated',
      total_pool: pool,
      jackpot_amount: Math.floor(pool * 0.4),
      tier4_amount: Math.floor(pool * 0.35),
      tier3_amount: Math.floor(pool * 0.25),
      participant_count: 0,
      jackpot_rollover: false,
      ...(publish && {
        published_at: new Date().toISOString(),
      }),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency, formatMonth, formatDate } from '@/lib//utils/utils';
import { checkMatch } from '@/lib/draw-engine';
import type { Draw, GolfScore, Winner } from '@/types';

export default async function DrawsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: draws }, { data: scores }, { data: winners }] = await Promise.all([
    supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('month', { ascending: false }),

    supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5),

    supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  // ✅ Typed data
  const typedDraws: Draw[] = draws ?? [];
  const typedScores: GolfScore[] = scores ?? [];
  const typedWinners: Winner[] = winners ?? [];

  const myScores = typedScores.map((s) => s.score);

  const totalWon = typedWinners.reduce(
    (sum, w) => sum + w.prize_amount,
    0
  );

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: '#f0fdf4', marginBottom: 4 }}>
          Draws & Prizes
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
          Monthly draw results and your prize history.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Won', value: formatCurrency(totalWon), badge: 'gold' },
          { label: 'Draws Entered', value: typedDraws.length.toString(), badge: 'green' },
          { label: 'Your Scores', value: myScores.length ? myScores.join(', ') : 'None yet', badge: 'blue' },
          { label: 'Wins', value: typedWinners.length.toString(), badge: 'green' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {s.label}
            </div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: '#f0fdf4' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Draws list */}
      {typedDraws.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎰</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            No draws published yet. Check back after the monthly draw!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {typedDraws.map((draw) => {
            const matchCount = myScores.length
              ? checkMatch(myScores, draw.winning_numbers)
              : 0;

            const myWin = typedWinners.find((w) => w.draw_id === draw.id);

            const tierLabel =
              matchCount >= 5
                ? '🏆 5-Match Jackpot!'
                : matchCount >= 4
                ? '🥈 4-Match Win!'
                : matchCount >= 3
                ? '🥉 3-Match Win!'
                : null;

            return (
              <div
                key={draw.id}
                className="card"
                style={{
                  borderColor: tierLabel
                    ? 'rgba(245,158,11,0.4)'
                    : 'rgba(34,197,94,0.12)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0fdf4', marginBottom: 4 }}>
                      {formatMonth(draw.month)}
                    </h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      Published {draw.published_at ? formatDate(draw.published_at) : ''} · {draw.participant_count} participants
                    </div>
                  </div>

                  {tierLabel && <div className="badge-gold">{tierLabel}</div>}
                </div>

                {/* Winning numbers */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                    Winning Numbers
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {draw.winning_numbers.map((n) => {
                      const isMatch = myScores.includes(n);

                      return (
                        <div
                          key={n}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                            background: isMatch
                              ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                              : 'rgba(34,197,94,0.12)',
                            color: isMatch ? '#050a06' : '#4ade80',
                            border: isMatch
                              ? 'none'
                              : '1px solid rgba(34,197,94,0.2)',
                          }}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>

                  {myScores.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color:
                          matchCount > 0
                            ? '#4ade80'
                            : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      You matched {matchCount} number
                      {matchCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Pool breakdown */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Jackpot</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>
                      {formatCurrency(draw.jackpot_amount)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>4-Match</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>
                      {formatCurrency(draw.tier4_amount)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>3-Match</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa' }}>
                      {formatCurrency(draw.tier3_amount)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Total Pool</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0fdf4' }}>
                      {formatCurrency(draw.total_pool)}
                    </div>
                  </div>
                </div>

                {/* Win info */}
                {myWin && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#fbbf24' }}>
                      🏆 You won {formatCurrency(myWin.prize_amount)} — Status:{' '}
                    </span>

                    <span
                      className={
                        myWin.payment_status === 'paid'
                          ? 'badge-green'
                          : myWin.payment_status === 'rejected'
                          ? 'badge-red'
                          : 'badge-gold'
                      }
                    >
                      {myWin.payment_status}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency, formatMonth } from '@/lib/utils/utils';
import type { Draw, Winner } from '@/types';

export default async function AdminReports() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [
    { count: totalUsers },
    { count: activeSubs },
    { count: monthlySubs },
    { count: yearlySubs },
    { data: draws },
    { data: winners },
    { data: charityContribs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'monthly'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'yearly'),
    supabase.from('draws').select('*').order('month', { ascending: false }).limit(12),

    // 👇 Only selected fields → partial type
    supabase.from('winners').select('prize_amount,payment_status,match_type'),

    supabase
      .from('subscriptions')
      .select('amount_cents,charity_percentage')
      .eq('status', 'active'),
  ]);

  // ✅ Derived types based on query shape
  type WinnerLite = Pick<Winner, 'prize_amount' | 'payment_status' | 'match_type'>;
  type CharityContrib = { amount_cents: number; charity_percentage: number };

  const typedDraws: Draw[] = draws ?? [];
  const typedWinners: WinnerLite[] = winners ?? [];
  const typedContribs: CharityContrib[] = charityContribs ?? [];

  // ✅ Calculations
  const totalPrizePaid = typedWinners
    .filter((w) => w.payment_status === 'paid')
    .reduce((s, w) => s + w.prize_amount, 0);

  const totalCharityMonth = typedContribs.reduce(
    (s, r) => s + Math.floor(r.amount_cents * (r.charity_percentage / 100)),
    0
  );

  type MatchType = Winner['match_type'];
  const matchTypes: MatchType[] = ['5-match', '4-match', '3-match'];

  const matchBreakdown = matchTypes.map((t) => ({
    type: t,
    count: typedWinners.filter((w) => w.match_type === t).length,
  }));

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: '#f0fdf4', marginBottom: 4 }}>
          Reports & Analytics
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
          Platform statistics and financial overview.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Users', value: totalUsers ?? 0, color: '#4ade80' },
          { label: 'Active Subscribers', value: activeSubs ?? 0, color: '#22c55e' },
          { label: 'Monthly Plans', value: monthlySubs ?? 0, color: '#60a5fa' },
          { label: 'Yearly Plans', value: yearlySubs ?? 0, color: '#a78bfa' },
          { label: 'Total Prizes Paid', value: formatCurrency(totalPrizePaid), color: '#f59e0b' },
          { label: 'Monthly Charity', value: formatCurrency(totalCharityMonth), color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {s.label}
            </div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        {/* Draw history */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0fdf4', marginBottom: 16 }}>
            Draw History
          </h2>

          {typedDraws.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              No draws yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {typedDraws.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                    {formatMonth(d.month)}
                  </span>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#4ade80' }}>
                      {formatCurrency(d.total_pool)}
                    </span>

                    <span
                      className={
                        d.status === 'published'
                          ? 'badge-green'
                          : 'badge-gold'
                      }
                      style={{ fontSize: 10 }}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win breakdown */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0fdf4', marginBottom: 16 }}>
            Win Type Breakdown
          </h2>

          {matchBreakdown.map((m) => (
            <div
              key={m.type}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                className={
                  m.type === '5-match'
                    ? 'badge-gold'
                    : m.type === '4-match'
                    ? 'badge-green'
                    : 'badge-blue'
                }
              >
                {m.type}
              </span>

              <span
                className="font-display"
                style={{ fontSize: 20, fontWeight: 700, color: '#f0fdf4' }}
              >
                {m.count}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Total Winners
            </span>

            <span
              className="font-display"
              style={{ fontSize: 18, fontWeight: 700, color: '#f0fdf4' }}
            >
              {typedWinners.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
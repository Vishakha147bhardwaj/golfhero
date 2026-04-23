import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050a06' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 24px',
        background: 'rgba(5,10,6,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34,197,94,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#050a06'
          }}>G</div>
          <span className="font-display" style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>GolfHero</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>Sign In</Link>
          <Link href="/auth/signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        <div className="animate-fade-up" style={{ maxWidth: 800 }}>
          <div className="badge-green" style={{ marginBottom: 20, fontSize: 13 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Monthly prize draws now open
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(44px, 8vw, 88px)',
            lineHeight: 1.08, fontWeight: 900,
            color: '#f0fdf4', marginBottom: 24
          }}>
            Golf That
            <br />
            <span className="gradient-text">Changes Lives</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.55)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Track your Stableford scores, enter monthly prize draws,
            and donate to charities you love — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Start Playing →
            </Link>
            <Link href="#how-it-works" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
              How It Works
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          marginTop: 80, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center',
          background: 'rgba(10,26,12,0.5)', borderRadius: 20, padding: '6px',
          border: '1px solid rgba(34,197,94,0.1)', backdropFilter: 'blur(20px)'
        }}>
          {[
            { label: 'Active Members', value: '2,400+' },
            { label: 'Prize Pool This Month', value: '£8,200' },
            { label: 'Charities Supported', value: '24' },
            { label: 'Total Donated', value: '£42,000+' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '16px 28px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(34,197,94,0.08)' : 'none'
            }}>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge-gold" style={{ marginBottom: 16 }}>Simple &amp; Transparent</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#f0fdf4' }}>
            How GolfHero Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            {
              step: '01', icon: '🏌️', title: 'Subscribe',
              desc: 'Choose monthly or yearly. A portion funds the prize pool and your chosen charity.'
            },
            {
              step: '02', icon: '⛳', title: 'Enter Scores',
              desc: 'Log your last 5 Stableford scores (1–45). Each score needs a date — no duplicates.'
            },
            {
              step: '03', icon: '🎰', title: 'Monthly Draw',
              desc: '5 numbers are drawn. Match 3, 4, or all 5 of your scores to win prizes.'
            },
            {
              step: '04', icon: '❤️', title: 'Give Back',
              desc: 'Min 10% of your sub goes to your charity. Increase anytime, or donate directly.'
            },
          ].map((item) => (
            <div key={item.step} className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 48, fontWeight: 900, color: 'rgba(34,197,94,0.06)',
                fontFamily: 'var(--font-display)', lineHeight: 1
              }}>{item.step}</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f0fdf4', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize Pools */}
      <section style={{ padding: '80px 24px', background: 'rgba(10,26,12,0.4)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#f0fdf4', marginBottom: 12 }}>
              Prize Pool Breakdown
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>60% of every subscription funds the prize pool</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { match: '5 Number Match', share: '40%', label: 'JACKPOT', rollover: true, color: '#f59e0b' },
              { match: '4 Number Match', share: '35%', label: 'TIER 2', rollover: false, color: '#22c55e' },
              { match: '3 Number Match', share: '25%', label: 'TIER 3', rollover: false, color: '#60a5fa' },
            ].map((tier) => (
              <div key={tier.match} className="card" style={{ textAlign: 'center', borderColor: `${tier.color}25` }}>
                <div style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 20,
                  background: `${tier.color}18`, color: tier.color,
                  fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 16
                }}>{tier.label}</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: tier.color, fontFamily: 'var(--font-display)' }}>
                  {tier.share}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{tier.match}</div>
                {tier.rollover && (
                  <div className="badge-gold" style={{ marginTop: 12, fontSize: 11 }}>↻ Jackpot Rolls Over</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#f0fdf4' }}>
            Simple Pricing
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              plan: 'Monthly', price: '£19.99', period: '/month',
              features: ['Monthly prize draw entry', 'Score tracking (5 rolling)', 'Charity contribution (10%+)', 'Winner verification system'],
              cta: 'Start Monthly', highlight: false
            },
            {
              plan: 'Yearly', price: '£199.99', period: '/year',
              badge: 'Save 16%',
              features: ['Everything in Monthly', '12 months of draw entries', 'Priority support', 'Yearly charity bonus entry'],
              cta: 'Start Yearly', highlight: true
            },
          ].map((plan) => (
            <div key={plan.plan} className="card" style={{
              textAlign: 'center', position: 'relative',
              borderColor: plan.highlight ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.12)',
              background: plan.highlight ? 'rgba(34,197,94,0.06)' : undefined,
              transform: plan.highlight ? 'scale(1.02)' : undefined
            }}>
              {plan.badge && (
                <div className="badge-gold" style={{ position: 'absolute', top: 16, right: 16 }}>{plan.badge}</div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>{plan.plan}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 24 }}>
                <span className="font-display" style={{ fontSize: 44, fontWeight: 800, color: '#4ade80' }}>{plan.price}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ padding: '6px 0', fontSize: 14, color: 'rgba(255,255,255,0.65)', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className={plan.highlight ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', fontSize: 15 }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Charities */}
      <section style={{ padding: '80px 24px', background: 'rgba(10,26,12,0.4)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="badge-green" style={{ marginBottom: 16 }}>❤️ Making a Difference</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#f0fdf4', marginBottom: 16 }}>
            Your Subscription Gives Back
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto 48px', lineHeight: 1.6 }}>
            Choose a charity at signup. Minimum 10% of your subscription goes directly to them, every month.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {['Cancer Research UK', 'Mind Mental Health', 'Golf Foundation', 'WaterAid', 'Macmillan Cancer', 'Age UK'].map((name, i) => (
              <div key={name} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `hsl(${[140, 200, 120, 180, 160, 220][i]}, 40%, 20%)`,
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22
                }}>
                  {['🎗️', '🧠', '⛳', '💧', '🌿', '👴'][i]}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{name}</div>
              </div>
            ))}
          </div>

          <Link href="/auth/signup" className="btn-primary" style={{ marginTop: 40, fontSize: 15, padding: '14px 36px' }}>
            Choose Your Charity →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#f0fdf4', marginBottom: 20 }}>
            Ready to Play<br />
            <span className="gradient-text">with Purpose?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, fontSize: 17, lineHeight: 1.6 }}>
            Join 2,400+ golfers who track scores, win prizes,<br />and support charities they love.
          </p>
          <Link href="/auth/signup" className="btn-primary" style={{ fontSize: 18, padding: '16px 48px' }}>
            Join GolfHero Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(34,197,94,0.08)',
        padding: '32px 24px',
        display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex',alignItems:'center',justifyContent:'center', fontSize:13,fontWeight:700,color:'#050a06' }}>G</div>
          <span className="font-display" style={{ fontSize: 16, color: '#4ade80', fontWeight: 700 }}>GolfHero</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
          © 2026 GolfHero. Play, Win, Give.
        </p>
      </footer>
    </main>
  );
}
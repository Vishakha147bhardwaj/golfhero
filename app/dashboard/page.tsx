import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, formatMonth } from '@/lib/utils/utils';
import { Subscription } from '@/types';
 
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
 
  const [{ data:profile },{ data:subscription },{ data:scores },{ data:draws }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id',user.id).single(),
    supabase.from('subscriptions').select('*, charities(name)').eq('user_id',user.id).eq('status','active').maybeSingle(),
    supabase.from('golf_scores').select('*').eq('user_id',user.id).order('score_date',{ascending:false}).limit(5),
    supabase.from('draws').select('*').eq('status','published').order('month',{ascending:false}).limit(3),
  ]);
 
  return (
    <div className="stagger" style={{ maxWidth:1000 }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Golfer'} 👋
        </h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Here&apos;s your GolfHero overview</p>
      </div>
 
      {/* Subscription banner if not subscribed */}
      {!subscription&&(
        <div className="card" style={{ marginBottom:24,borderColor:'rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
          <div>
            <div style={{ fontSize:16,fontWeight:600,color:'#fbbf24',marginBottom:4 }}>No Active Subscription</div>
            <p style={{ fontSize:14,color:'rgba(255,255,255,0.5)' }}>Subscribe to enter monthly draws and support your charity.</p>
          </div>
          <Link href="/dashboard/subscribe" className="btn-gold" style={{ fontSize:14,padding:'10px 20px' }}>Subscribe Now →</Link>
        </div>
      )}
 
      {/* Stat cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24 }}>
        {[
          { label:'Subscription',value:subscription?'Active':'Inactive',badge:subscription?'green':'gray',sub:subscription?`Renews ${formatDate(subscription.current_period_end)}`:'Not subscribed' },
          { label:'Scores Entered',value:`${scores?.length??0}/5`,badge:'blue',sub:'Rolling last 5 scores' },
          { label:'Charity',value:subscription?(subscription as Subscription).charities?.name??'Not set':'—',badge:'green',sub:subscription?`${subscription.charity_percentage}% of subscription`:'Subscribe to choose' },
          { label:'Latest Score',value:scores?.length?(scores[0].score).toString():'—',badge:'gold',sub:scores?.length?formatDate(scores[0].score_date):'No scores yet' },
        ].map(s=>(
          <div key={s.label} className="card">
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:0.5 }}>{s.label}</div>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
              <span className="font-display" style={{ fontSize:24,fontWeight:700,color:'#f0fdf4' }}>{s.value}</span>
              <span className={`badge-${s.badge}`} style={{ fontSize:10 }}>●</span>
            </div>
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.35)' }}>{s.sub}</div>
          </div>
        ))}
      </div>
 
      {/* Scores + Draws grid */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20 }}>
        {/* Recent Scores */}
        <div className="card">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
            <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4' }}>Recent Scores</h2>
            <Link href="/dashboard/scores" className="badge-green" style={{ textDecoration:'none',fontSize:11 }}>Manage →</Link>
          </div>
          {scores&&scores.length>0?(
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {scores.map((s,i)=>(
                <div key={s.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderRadius:10,background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.08)' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ width:24,height:24,borderRadius:'50%',background:i===0?'#22c55e':'rgba(34,197,94,0.15)',color:i===0?'#050a06':'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700 }}>{i+1}</span>
                    <span style={{ fontSize:14,color:'rgba(255,255,255,0.6)' }}>{formatDate(s.score_date)}</span>
                  </div>
                  <span className="font-display" style={{ fontSize:20,fontWeight:700,color:'#4ade80' }}>{s.score}</span>
                </div>
              ))}
            </div>
          ):(
            <div style={{ textAlign:'center',padding:'24px 0',color:'rgba(255,255,255,0.3)',fontSize:14 }}>
              No scores yet.<br />
              <Link href="/dashboard/scores" style={{ color:'#4ade80',textDecoration:'none' }}>Add your first score →</Link>
            </div>
          )}
        </div>
 
        {/* Recent Draws */}
        <div className="card">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
            <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4' }}>Recent Draws</h2>
            <Link href="/dashboard/draws" className="badge-green" style={{ textDecoration:'none',fontSize:11 }}>View All →</Link>
          </div>
          {draws&&draws.length>0?(
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {draws.map(d=>(
                <div key={d.id} style={{ padding:'12px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                    <span style={{ fontSize:14,fontWeight:600,color:'#f0fdf4' }}>{formatMonth(d.month)}</span>
                    <span className="badge-green">Published</span>
                  </div>
                  <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                    {d.winning_numbers.map((n:number)=>(
                      <span key={n} style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#050a06',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700 }}>{n}</span>
                    ))}
                  </div>
                  <div style={{ marginTop:8,fontSize:12,color:'rgba(255,255,255,0.4)' }}>Pool: {formatCurrency(d.total_pool)}</div>
                </div>
              ))}
            </div>
          ):(
            <div style={{ textAlign:'center',padding:'24px 0',color:'rgba(255,255,255,0.3)',fontSize:14 }}>No draws published yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
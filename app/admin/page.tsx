import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/utils';
import type { Draw } from '@/types';

 
export default async function AdminOverview() {
type CharityStat = {
  amount_cents: number;
  charity_percentage: number;
};
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
 
  const [{ count:totalUsers },{ count:activeSubs },{ data:charityStats },{ data:recentDraws }] = await Promise.all([
    supabase.from('profiles').select('*',{count:'exact',head:true}),
    supabase.from('subscriptions').select('*',{count:'exact',head:true}).eq('status','active'),
    supabase.from('subscriptions').select('amount_cents,charity_percentage').eq('status','active'),
    supabase.from('draws').select('*').order('created_at',{ascending:false}).limit(5),
  ]);
 
  const totalCharityMonthly = (charityStats??[]).reduce((s:number,r:CharityStat)=>s+Math.floor(r.amount_cents*(r.charity_percentage/100)),0);
  const estimatedPool = (activeSubs??0)*1999*0.6;
 
  const stats = [
    { label:'Total Users', value:(totalUsers??0).toString(), color:'#4ade80', icon:'👥' },
    { label:'Active Subscribers', value:(activeSubs??0).toString(), color:'#22c55e', icon:'✅' },
    { label:'Est. Prize Pool', value:formatCurrency(estimatedPool), color:'#f59e0b', icon:'🏆' },
    { label:'Monthly Charity', value:formatCurrency(totalCharityMonthly), color:'#60a5fa', icon:'❤️' },
  ];
 
  return (
    <div style={{ maxWidth:1000 }}>
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>Admin Overview</h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Platform health at a glance.</p>
      </div>
 
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32 }}>
        {stats.map(s=>(
          <div key={s.label} className="card">
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <span style={{ fontSize:12,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:0.5 }}>{s.label}</span>
            </div>
            <div className="font-display" style={{ fontSize:28,fontWeight:800,color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
 
      <div className="card">
        <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4',marginBottom:16 }}>Recent Draws</h2>
        {(!recentDraws||recentDraws.length===0)?(
          <p style={{ color:'rgba(255,255,255,0.35)',fontSize:14 }}>No draws yet.</p>
        ):(
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Month','Status','Type','Pool','Numbers'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px',textAlign:'left',fontSize:12,color:'rgba(255,255,255,0.4)',fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDraws.map((d:Draw)=>(
                <tr key={d.id} className="table-row">
                  <td style={{ padding:'10px 12px',fontSize:14,color:'#f0fdf4' }}>{d.month}</td>
                  <td style={{ padding:'10px 12px' }}><span className={d.status==='published'?'badge-green':d.status==='simulated'?'badge-gold':'badge-gray'}>{d.status}</span></td>
                  <td style={{ padding:'10px 12px',fontSize:13,color:'rgba(255,255,255,0.5)',textTransform:'capitalize' }}>{d.draw_type}</td>
                  <td style={{ padding:'10px 12px',fontSize:13,color:'#4ade80' }}>{formatCurrency(d.total_pool)}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex',gap:4 }}>
                      {(d.winning_numbers??[]).map((n:number)=>(
                        <span key={n} style={{ width:26,height:26,borderRadius:'50%',background:'rgba(34,197,94,0.2)',color:'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700 }}>{n}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
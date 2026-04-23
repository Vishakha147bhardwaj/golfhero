'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils/utils';
import { Winner,PaymentStatus, Draw, Profile } from '@/types';
  type WinnerWithRelations = Winner & {
  profiles?: Profile;
  draws?: Draw;
};
 
export default function AdminWinners() {
 const [winners, setWinners] = useState<Winner[]>([]);
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState('');
  const supabase = createClient();
 
 
  async function load() {
    let q = supabase.from('winners').select('*, profiles(full_name,email), draws(month)').order('created_at',{ascending:false});
    if (filter!=='all') q = q.eq('payment_status',filter);
    const { data } = await q;
    setWinners(data??[]);
  }
 useEffect(() => {
  async function fetchData() {
    await load();
  }
  fetchData();
}, [filter]);
 
  async function updateStatus(id: string,status: PaymentStatus) {
  const upd: Partial<Winner> = { payment_status: status };
  if (status === 'paid') {
    upd.paid_at = new Date().toISOString();
  } else if (status !== 'pending') {
    upd.verified_at = new Date().toISOString();
  }

  await supabase.from('winners').update(upd).eq('id', id);

  setMsg(`Winner marked as ${status}`);
  load();
}
 
  return (
    <div style={{ maxWidth:1000 }}>
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>Winners</h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Verify submissions and manage payouts.</p>
      </div>
 
      <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
        {['all','pending','paid','rejected'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={filter===f?'btn-primary btn-sm':'btn-secondary btn-sm'} style={{ textTransform:'capitalize' }}>{f}</button>
        ))}
      </div>
 
      {msg&&<div style={{ marginBottom:16,padding:'10px 14px',borderRadius:10,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',fontSize:14 }}>{msg}</div>}
 
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)' }}>
              {['Winner','Draw','Match','Prize','Status','Proof','Actions'].map(h=>(
                <th key={h} style={{ padding:'14px 16px',textAlign:'left',fontSize:12,color:'rgba(255,255,255,0.4)',fontWeight:500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {winners.map((w:WinnerWithRelations)=>(
              <tr key={w.id} className="table-row">
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ fontSize:14,fontWeight:500,color:'#f0fdf4' }}>{w.profiles?.full_name}</div>
                  <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>{w.profiles?.email}</div>
                </td>
                <td style={{ padding:'12px 16px',fontSize:13,color:'rgba(255,255,255,0.55)' }}>{w.draws?.month}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span className={w.match_type==='5-match'?'badge-gold':w.match_type==='4-match'?'badge-green':'badge-blue'}>{w.match_type}</span>
                </td>
                <td style={{ padding:'12px 16px',fontSize:14,fontWeight:600,color:'#4ade80' }}>{formatCurrency(w.prize_amount)}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span className={w.payment_status==='paid'?'badge-green':w.payment_status==='rejected'?'badge-red':'badge-gold'}>{w.payment_status}</span>
                </td>
                <td style={{ padding:'12px 16px' }}>
                  {w.proof_url?<a href={w.proof_url} target="_blank" rel="noreferrer" className="badge-blue" style={{ textDecoration:'none',fontSize:11 }}>View →</a>:<span style={{ fontSize:12,color:'rgba(255,255,255,0.3)' }}>None</span>}
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex',gap:6 }}>
                    {w.payment_status==='pending'&&<>
                      <button className="btn-primary btn-sm" onClick={()=>updateStatus(w.id,'paid')}>Pay</button>
                      <button className="btn-danger btn-sm" onClick={()=>updateStatus(w.id,'rejected')}>Reject</button>
                    </>}
                    {w.payment_status==='rejected'&&<button className="btn-secondary btn-sm" onClick={()=>updateStatus(w.id,'pending')}>Restore</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {winners.length===0&&<div style={{ padding:'32px',textAlign:'center',color:'rgba(255,255,255,0.35)' }}>No winners {filter!=='all'?`with status "${filter}"`:'yet'}.</div>}
      </div>
    </div>
  );
}
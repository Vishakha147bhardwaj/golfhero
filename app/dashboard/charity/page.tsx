'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib//utils/utils';
import type { Charity, Subscription } from '@/types';
 
export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selected, setSelected] = useState('');
  const [pct, setPct] = useState(10);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const supabase = createClient();
 
  useEffect(()=>{
    (async()=>{
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data:ch },{ data:sub }] = await Promise.all([
        supabase.from('charities').select('*').eq('active',true).order('featured',{ascending:false}),
        supabase.from('subscriptions').select('*').eq('user_id',user.id).eq('status','active').maybeSingle()
      ]);
      setCharities(ch??[]);
      setSubscription(sub);
      if (sub) { setSelected(sub.charity_id??''); setPct(sub.charity_percentage??10); }
    })();
  },[]);
 
  async function save() {
    setSaving(true); setMsg('');
    if (!subscription) { setMsg('You need an active subscription to choose a charity.'); setSaving(false); return; }
    const { error } = await supabase.from('subscriptions').update({ charity_id:selected||null, charity_percentage:pct }).eq('id',subscription.id);
    setMsg(error?error.message:'Charity preference saved!');
    setSaving(false);
  }
 
  const charityAmount = subscription ? Math.floor(subscription.amount_cents * (pct/100)) : 0;
 
  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>My Charity</h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Choose who benefits from your subscription.</p>
      </div>
 
      {!subscription&&(
        <div className="card" style={{ marginBottom:24,borderColor:'rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.05)' }}>
          <p style={{ color:'#fbbf24',fontSize:15 }}>You need an active subscription to select a charity.</p>
        </div>
      )}
 
      {/* Contribution slider */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4',marginBottom:16 }}>Contribution Percentage</h2>
        <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:12 }}>
          <input type="range" min={10} max={50} value={pct} onChange={e=>setPct(parseInt(e.target.value))}
            style={{ flex:1,accentColor:'#22c55e',height:6 }} />
          <span className="font-display" style={{ fontSize:28,fontWeight:700,color:'#4ade80',minWidth:60,textAlign:'right' }}>{pct}%</span>
        </div>
        <p style={{ fontSize:13,color:'rgba(255,255,255,0.4)' }}>
          {subscription?<>You&apos;ll donate <strong style={{ color:'#4ade80' }}>{formatCurrency(charityAmount)}</strong> per month (min 10%)</>:'Subscribe to activate charity giving'}
        </p>
      </div>
 
      {/* Charity selection */}
      <div className="card">
        <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4',marginBottom:16 }}>Select Your Charity</h2>
        {charities.length===0?(
          <p style={{ color:'rgba(255,255,255,0.35)',fontSize:14 }}>No charities available.</p>
        ):(
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:20 }}>
            {charities.map(c=>(
              <div key={c.id} onClick={()=>setSelected(c.id)} style={{
                padding:16,borderRadius:14,cursor:'pointer',transition:'all .2s',border:'2px solid',
                borderColor:selected===c.id?'#22c55e':'rgba(34,197,94,0.1)',
                background:selected===c.id?'rgba(34,197,94,0.1)':'rgba(34,197,94,0.03)'
              }}>
                {c.featured&&<div className="badge-gold" style={{ marginBottom:8,fontSize:10 }}>⭐ Featured</div>}
                <div style={{ fontSize:15,fontWeight:600,color:'#f0fdf4',marginBottom:4 }}>{c.name}</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.4 }}>{c.description?.slice(0,80)}{c.description?.length>80?'...':''}</div>
                {c.total_raised>0&&<div className="badge-green" style={{ marginTop:8,fontSize:10 }}>Raised: {formatCurrency(c.total_raised)}</div>}
              </div>
            ))}
          </div>
        )}
        {msg&&<div style={{ marginBottom:12,padding:'10px 14px',borderRadius:10,fontSize:14,background:msg.includes('saved')?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:msg.includes('saved')?'#4ade80':'#f87171',border:`1px solid ${msg.includes('saved')?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}` }}>{msg}</div>}
        <button className="btn-primary" onClick={save} disabled={saving||!subscription} style={{ fontSize:15 }}>
          {saving?'Saving...':'Save Charity Preference'}
        </button>
      </div>
    </div>
  );
}
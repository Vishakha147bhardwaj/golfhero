'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatMonth, getMonthYear } from '@/lib/utils/utils';
import { generateRandomDraw, generateAlgorithmicDraw } from '@/lib/draw-engine';
import type { Draw } from '@/types';
 
export default function AdminDraws() {
    type ScoreOnly = { score: number };
  const [draws, setDraws] = useState<Draw[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ month:getMonthYear(), draw_type:'random', total_pool:0 });
  const [preview, setPreview] = useState<number[]|null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const supabase = createClient();
 
  async function load() {
    const { data } = await supabase.from('draws').select('*').order('month',{ascending:false});
    setDraws(data??[]);
  }
useEffect(() => {
  const fetchData = async () => {
    await load();
  };
  fetchData();
}, []);
 
  async function runSimulation() {
    setLoading(true);
    let result;
    if (form.draw_type==='algorithmic') {
      const { data:scores } = await supabase.from('golf_scores').select('score');
 const typedScores = (scores ?? []) as ScoreOnly[];
const allScores = typedScores.map((s) => s.score);
      result = generateAlgorithmicDraw(allScores);
    } else {
      result = generateRandomDraw();
    }
    setPreview(result.winningNumbers);
    setLoading(false);
  }
 
  async function createDraw(publish: boolean) {
    if (!preview) { setMsg('Run a simulation first'); return; }
    setLoading(true);
    const pool = form.total_pool * 100;
    const { error } = await supabase.from('draws').insert({
      month: form.month,
      draw_type: form.draw_type,
      winning_numbers: preview,
      status: publish ? 'published' : 'simulated',
      total_pool: pool,
      jackpot_amount: Math.floor(pool*0.4),
      tier4_amount: Math.floor(pool*0.35),
      tier3_amount: Math.floor(pool*0.25),
      participant_count: 0,
      jackpot_rollover: false,
      ...(publish ? { published_at: new Date().toISOString() } : {}),
    });
    if (error) setMsg(error.message);
    else { setMsg(publish?'Draw published!':'Draw saved as simulation'); setCreating(false); setPreview(null); load(); }
    setLoading(false);
  }
 
  async function publishDraw(id: string) {
    await supabase.from('draws').update({ status:'published', published_at:new Date().toISOString() }).eq('id',id);
    setMsg('Draw published!'); load();
  }
 
  async function deleteDraw(id: string) {
    if (!confirm('Delete this draw?')) return;
    await supabase.from('draws').delete().eq('id',id);
    load();
  }
 
  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>Draws</h1>
          <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Configure, simulate, and publish monthly draws.</p>
        </div>
        <button className="btn-gold" onClick={()=>setCreating(!creating)}>+ New Draw</button>
      </div>
 
      {msg&&<div style={{ marginBottom:16,padding:'10px 14px',borderRadius:10,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',fontSize:14 }}>{msg}</div>}
 
      {creating&&(
        <div className="card" style={{ marginBottom:24,borderColor:'rgba(245,158,11,0.3)' }}>
          <h2 style={{ fontSize:16,fontWeight:600,color:'#fbbf24',marginBottom:20 }}>Configure Draw</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:20 }}>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Month</label>
              <input className="input-field" type="month" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Draw Type</label>
              <select className="select-field" value={form.draw_type} onChange={e=>setForm({...form,draw_type:e.target.value})}>
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Total Pool (£)</label>
              <input className="input-field" type="number" min={0} value={form.total_pool} onChange={e=>setForm({...form,total_pool:parseFloat(e.target.value)||0})} />
            </div>
          </div>
 
          <div style={{ display:'flex',gap:10,flexWrap:'wrap',marginBottom:preview?20:0 }}>
            <button className="btn-secondary" onClick={runSimulation} disabled={loading}>
              {loading?'Simulating...':'▶ Run Simulation'}
            </button>
            <button className="btn-danger" onClick={()=>{ setCreating(false); setPreview(null); }}>Cancel</button>
          </div>
 
          {preview&&(
            <div style={{ marginTop:20,padding:16,borderRadius:14,background:'rgba(34,197,94,0.05)',border:'1px solid rgba(34,197,94,0.15)' }}>
              <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:10 }}>Simulated Numbers:</div>
              <div style={{ display:'flex',gap:10,marginBottom:16 }}>
                {preview.map(n=>(
                  <div key={n} style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#050a06',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700 }}>{n}</div>
                ))}
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="btn-secondary" onClick={()=>createDraw(false)} disabled={loading}>Save as Draft</button>
                <button className="btn-primary" onClick={()=>createDraw(true)} disabled={loading}>{loading?'Publishing...':'Publish Draw'}</button>
                <button className="btn-secondary" onClick={runSimulation} disabled={loading}>Re-simulate</button>
              </div>
            </div>
          )}
        </div>
      )}
 
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {draws.map((d:Draw)=>(
          <div key={d.id} className="card" style={{ display:'flex',alignItems:'center',flexWrap:'wrap',gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap' }}>
                <span style={{ fontSize:15,fontWeight:600,color:'#f0fdf4' }}>{formatMonth(d.month)}</span>
                <span className={d.status==='published'?'badge-green':d.status==='simulated'?'badge-gold':'badge-gray'}>{d.status}</span>
                <span className="badge-blue" style={{ fontSize:10,textTransform:'capitalize' }}>{d.draw_type}</span>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                {(d.winning_numbers??[]).map((n:number)=>(
                  <span key={n} style={{ width:28,height:28,borderRadius:'50%',background:'rgba(34,197,94,0.15)',color:'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700 }}>{n}</span>
                ))}
              </div>
              <div style={{ marginTop:8,fontSize:12,color:'rgba(255,255,255,0.4)' }}>Pool: {formatCurrency(d.total_pool)}</div>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              {d.status!=='published'&&(
                <button className="btn-primary btn-sm" onClick={()=>publishDraw(d.id)}>Publish</button>
              )}
              <button className="btn-danger btn-sm" onClick={()=>deleteDraw(d.id)}>Delete</button>
            </div>
          </div>
        ))}
        {draws.length===0&&<div style={{ textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.3)' }}>No draws yet. Create your first draw above.</div>}
      </div>
    </div>
  );
}
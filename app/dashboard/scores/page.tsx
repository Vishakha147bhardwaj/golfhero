'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils/utils';
 
interface Score { id:string; score:number; score_date:string; }
 
export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [form, setForm] = useState({ score:'', score_date:'' });
  const [editId, setEditId] = useState<string|null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
 
  async function loadScores() {
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('golf_scores').select('*').eq('user_id',user.id).order('score_date',{ascending:false});
    setScores(data ?? []);
  }
 
useEffect(() => {
  const fetchData = async () => {
    await loadScores();
  };
  fetchData();
}, []);
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const scoreNum = parseInt(form.score);
    if (isNaN(scoreNum)||scoreNum<1||scoreNum>45) { setError('Score must be between 1 and 45'); setLoading(false); return; }
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
 
    if (editId) {
      const { error } = await supabase.from('golf_scores').update({ score:scoreNum, score_date:form.score_date }).eq('id',editId).eq('user_id',user.id);
      if (error) { setError(error.message); setLoading(false); return; }
      setEditId(null);
    } else {
      // Check duplicate date
      const { data:existing } = await supabase.from('golf_scores').select('id').eq('user_id',user.id).eq('score_date',form.score_date);
      if (existing&&existing.length>0) { setError('You already have a score for this date. Edit or delete it first.'); setLoading(false); return; }
      // Rolling 5 — delete oldest if at 5
      const { data:current } = await supabase.from('golf_scores').select('*').eq('user_id',user.id).order('score_date',{ascending:true});
      if (current && current.length>=5) {
        await supabase.from('golf_scores').delete().eq('id',current[0].id);
      }
      const { error } = await supabase.from('golf_scores').insert({ user_id:user.id, score:scoreNum, score_date:form.score_date });
      if (error) { setError(error.message); setLoading(false); return; }
    }
    setForm({ score:'', score_date:'' });
    loadScores(); setLoading(false);
  }
 
  async function handleDelete(id: string) {
    if (!confirm('Delete this score?')) return;
    await supabase.from('golf_scores').delete().eq('id',id);
    loadScores();
  }
 
  function startEdit(s: Score) {
    setEditId(s.id); setForm({ score:s.score.toString(), score_date:s.score_date });
  }
 
  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>My Scores</h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>Track your last 5 Stableford scores (1–45). One score per date.</p>
      </div>
 
      {/* Form */}
      <div className="card" style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4',marginBottom:16 }}>{editId?'Edit Score':'Add Score'}</h2>
        <form onSubmit={handleSubmit} style={{ display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end' }}>
          <div style={{ flex:'1 1 160px' }}>
            <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Score (1–45)</label>
            <input className="input-field" type="number" min={1} max={45} placeholder="e.g. 32" required value={form.score} onChange={e=>setForm({...form,score:e.target.value})} />
          </div>
          <div style={{ flex:'1 1 180px' }}>
            <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Date Played</label>
            <input className="input-field" type="date" required value={form.score_date} onChange={e=>setForm({...form,score_date:e.target.value})} max={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding:'12px 20px' }}>
              {loading?(editId?'Saving...':'Adding...'):(editId?'Save Edit':'Add Score')}
            </button>
            {editId&&<button type="button" className="btn-secondary" onClick={()=>{ setEditId(null); setForm({score:'',score_date:''}); }} style={{ padding:'12px 16px' }}>Cancel</button>}
          </div>
        </form>
        {error&&<div style={{ marginTop:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'10px 14px',color:'#f87171',fontSize:14 }}>{error}</div>}
      </div>
 
      {/* Scores list */}
      <div className="card">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4' }}>Your Scores ({scores.length}/5)</h2>
          <div className="badge-blue">{scores.length<5?`${5-scores.length} slots remaining`:'Full — adding removes oldest'}</div>
        </div>
        {scores.length===0?(
          <div style={{ textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)' }}>No scores yet. Add your first score above.</div>
        ):(
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {scores.map((s,i)=>(
              <div key={s.id} className="table-row" style={{ display:'flex',alignItems:'center',padding:'12px 8px',borderRadius:10 }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:i===0?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(34,197,94,0.1)',color:i===0?'#050a06':'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,marginRight:14,flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <span className="font-display" style={{ fontSize:22,fontWeight:700,color:'#4ade80',marginRight:12 }}>{s.score}</span>
                  <span style={{ fontSize:13,color:'rgba(255,255,255,0.45)' }}>{formatDate(s.score_date)}</span>
                </div>
                {i===0&&<span className="badge-green" style={{ marginRight:8,fontSize:10 }}>Latest</span>}
                <div style={{ display:'flex',gap:6 }}>
                  <button className="btn-secondary btn-sm" onClick={()=>startEdit(s)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={()=>handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
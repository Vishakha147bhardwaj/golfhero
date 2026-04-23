'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/utils';
import { Charity } from '@/types';

 
export default function AdminCharities() {
const [charities, setCharities] = useState<Charity[]>([]);
  const [form, setForm] = useState({ name:'', description:'', website_url:'', image_url:'', featured:false });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const supabase = createClient();
 
  async function load() {
    const { data } = await supabase.from('charities').select('*').order('featured',{ascending:false}).order('name');
    setCharities(data??[]);
  }
useEffect(() => {
  const fetchData = async () => {
    await load();
  };
  fetchData();
}, []);
 
  async function save() {
    if (!form.name) return;
    const { error } = await supabase.from('charities').insert({ ...form, active:true, total_raised:0 });
    if (error) setMsg(error.message); else { setMsg('Charity added!'); setCreating(false); setForm({ name:'',description:'',website_url:'',image_url:'',featured:false }); load(); }
  }
 
  async function toggle(id: string, field: string, val: boolean) {
    await supabase.from('charities').update({ [field]:!val }).eq('id',id);
    load();
  }
 
  async function del(id: string) {
    if (!confirm('Delete this charity?')) return;
    await supabase.from('charities').delete().eq('id',id);
    load();
  }
 
  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>Charities</h1>
          <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>{charities.length} charities listed</p>
        </div>
        <button className="btn-primary" onClick={()=>setCreating(!creating)}>+ Add Charity</button>
      </div>
 
      {msg&&<div style={{ marginBottom:16,padding:'10px 14px',borderRadius:10,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',fontSize:14 }}>{msg}</div>}
 
      {creating&&(
        <div className="card" style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:16,fontWeight:600,color:'#f0fdf4',marginBottom:16 }}>New Charity</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div><label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Name *</label>
              <input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Charity name" /></div>
            <div><label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Description</label>
              <input className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short description" /></div>
            <div><label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Website URL</label>
              <input className="input-field" type="url" value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})} placeholder="https://..." /></div>
            <div><label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Image URL</label>
              <input className="input-field" type="url" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..." /></div>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <input type="checkbox" id="feat" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} style={{ accentColor:'#22c55e',width:16,height:16 }} />
              <label htmlFor="feat" style={{ fontSize:14,color:'rgba(255,255,255,0.6)',cursor:'pointer' }}>Featured charity</label>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button className="btn-primary" onClick={save}>Save Charity</button>
              <button className="btn-secondary" onClick={()=>setCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
 
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
        {charities.map(c=>(
          <div key={c.id} className="card">
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12 }}>
              <div>
                {c.featured&&<div className="badge-gold" style={{ marginBottom:6 }}>⭐ Featured</div>}
                <div style={{ fontSize:15,fontWeight:600,color:'#f0fdf4' }}>{c.name}</div>
              </div>
              <span className={c.active?'badge-green':'badge-red'} style={{ flexShrink:0 }}>{c.active?'Active':'Inactive'}</span>
            </div>
            {c.description&&<p style={{ fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:12,lineHeight:1.5 }}>{c.description}</p>}
            <div style={{ fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:16 }}>Raised: {formatCurrency(c.total_raised)}</div>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              <button className="btn-secondary btn-sm" onClick={()=>toggle(c.id,'featured',c.featured)}>{c.featured?'Unfeature':'Feature'}</button>
              <button className="btn-secondary btn-sm" onClick={()=>toggle(c.id,'active',c.active)}>{c.active?'Disable':'Enable'}</button>
              <button className="btn-danger btn-sm" onClick={()=>del(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {charities.length===0&&<div style={{ gridColumn:'1/-1',textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.3)' }}>No charities yet.</div>}
      </div>
    </div>
  );
}
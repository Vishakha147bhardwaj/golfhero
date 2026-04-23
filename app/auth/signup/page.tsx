'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/dashboard');
  }

  return (
    <div style={{ minHeight:'100vh', background:'#050a06', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:32 }}>
            <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#050a06' }}>G</div>
            <span className="font-display" style={{ fontSize:20,fontWeight:700,color:'#4ade80' }}>GolfHero</span>
          </Link>
          <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:8 }}>Create Account</h1>
          <p style={{ color:'rgba(255,255,255,0.4)',fontSize:15 }}>Join the community. Play with purpose.</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Full Name</label>
              <input className="input-field" type="text" placeholder="Your name" required
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Email</label>
              <input className="input-field" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginBottom:6,display:'block' }}>Password</label>
              <input className="input-field" type="password" placeholder="Min 8 characters" required minLength={8}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            {error && (
              <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'10px 14px',color:'#f87171',fontSize:14 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:8, fontSize:15, padding:'13px' }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:20, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color:'rgba(255,255,255,0.4)',fontSize:14 }}>Already have an account? </span>
            <Link href="/auth/login" style={{ color:'#4ade80',fontSize:14,textDecoration:'none',fontWeight:500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
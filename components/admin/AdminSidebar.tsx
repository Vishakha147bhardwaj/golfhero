'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
 
const links = [
  { href:'/admin', label:'Overview', icon:'⊞' },
  { href:'/admin/users', label:'Users', icon:'👥' },
  { href:'/admin/draws', label:'Draws', icon:'🎰' },
  { href:'/admin/charities', label:'Charities', icon:'❤️' },
  { href:'/admin/winners', label:'Winners', icon:'🏆' },
  { href:'/admin/reports', label:'Reports', icon:'📊' },
];
 
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }
  return (
    <aside style={{ width:240,flexShrink:0,background:'rgba(5,10,6,0.98)',borderRight:'1px solid rgba(245,158,11,0.1)',display:'flex',flexDirection:'column',minHeight:'100vh',padding:'24px 12px' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:'0 8px' }}>
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#050a06' }}>A</div>
        <span className="font-display" style={{ fontSize:16,fontWeight:700,color:'#fbbf24' }}>Admin Panel</span>
      </div>
      <div className="badge-gold" style={{ marginBottom:24,marginLeft:8,fontSize:10 }}>GolfHero Admin</div>
      <nav style={{ display:'flex',flexDirection:'column',gap:4,flex:1 }}>
        {links.map(l=>{
          const active = pathname===l.href||(l.href!=='/admin'&&pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} style={{
              display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:500,transition:'all .15s',
              background:active?'rgba(245,158,11,0.12)':'transparent',
              color:active?'#fbbf24':'rgba(255,255,255,0.5)',
              border:active?'1px solid rgba(245,158,11,0.2)':'1px solid transparent'
            }}>
              <span style={{ fontSize:16 }}>{l.icon}</span>{l.label}
            </Link>
          );
        })}
        <Link href="/dashboard" style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,textDecoration:'none',fontSize:14,color:'rgba(255,255,255,0.35)',marginTop:8 }}>
          <span>↩</span> User View
        </Link>
      </nav>
      <button onClick={logout} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'transparent',border:'none',color:'rgba(255,255,255,0.35)',fontSize:14,cursor:'pointer',width:'100%' }}
        onMouseEnter={e=>(e.currentTarget.style.color='#f87171')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
        <span>↩</span> Sign Out
      </button>
    </aside>
  );
}
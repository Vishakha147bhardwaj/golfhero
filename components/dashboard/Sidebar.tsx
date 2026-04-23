'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
 
const links = [
  { href:'/dashboard', label:'Dashboard', icon:'⊞' },
  { href:'/dashboard/scores', label:'My Scores', icon:'⛳' },
  { href:'/dashboard/charity', label:'My Charity', icon:'❤️' },
  { href:'/dashboard/draws', label:'Draws & Prizes', icon:'🎰' },
];
 
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }
  return (
    <aside style={{ width:240,flexShrink:0,background:'rgba(5,10,6,0.95)',borderRight:'1px solid rgba(34,197,94,0.08)',display:'flex',flexDirection:'column',minHeight:'100vh',padding:'24px 12px' }}>
      <Link href="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none',marginBottom:32,padding:'0 8px' }}>
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#050a06' }}>G</div>
        <span className="font-display" style={{ fontSize:18,fontWeight:700,color:'#4ade80' }}>GolfHero</span>
      </Link>
      <nav style={{ display:'flex',flexDirection:'column',gap:4,flex:1 }}>
        {links.map(l=>{
          const active = pathname===l.href||(l.href!=='/dashboard'&&pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} style={{
              display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:500,transition:'all .15s',
              background:active?'rgba(34,197,94,0.12)':'transparent',
              color:active?'#4ade80':'rgba(255,255,255,0.5)',
              border:active?'1px solid rgba(34,197,94,0.2)':'1px solid transparent'
            }}>
              <span style={{ fontSize:16 }}>{l.icon}</span>{l.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'transparent',border:'none',color:'rgba(255,255,255,0.35)',fontSize:14,cursor:'pointer',transition:'color .15s',width:'100%' }}
        onMouseEnter={e=>(e.currentTarget.style.color='#f87171')}
        onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
        <span>↩</span> Sign Out
      </button>
    </aside>
  );
}
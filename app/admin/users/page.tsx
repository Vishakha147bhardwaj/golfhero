import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils/utils';
import type { Profile, Subscription } from '@/types';
 
export default async function AdminUsers() {
    type UserWithSubscription = Profile & {
  subscriptions?: Subscription[];
};
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
 
  const { data:users } = await supabase
    .from('profiles')
    .select('*, subscriptions(status,plan,amount_cents)')
    .order('created_at',{ascending:false});
 
  return (
    <div style={{ maxWidth:1100 }}>
      <div style={{ marginBottom:32 }}>
        <h1 className="font-display" style={{ fontSize:32,fontWeight:800,color:'#f0fdf4',marginBottom:4 }}>Users</h1>
        <p style={{ color:'rgba(255,255,255,0.45)',fontSize:15 }}>{users?.length??0} total registered users</p>
      </div>
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)' }}>
              {['Name','Email','Role','Subscription','Joined'].map(h=>(
                <th key={h} style={{ padding:'14px 16px',textAlign:'left',fontSize:12,color:'rgba(255,255,255,0.4)',fontWeight:500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users??[]).map((u:UserWithSubscription)=>{
              const sub = u.subscriptions?.[0];
              return (
                <tr key={u.id} className="table-row">
                  <td style={{ padding:'12px 16px',fontSize:14,color:'#f0fdf4',fontWeight:500 }}>{u.full_name}</td>
                  <td style={{ padding:'12px 16px',fontSize:13,color:'rgba(255,255,255,0.55)' }}>{u.email}</td>
                  <td style={{ padding:'12px 16px' }}><span className={u.role==='admin'?'badge-gold':'badge-gray'}>{u.role}</span></td>
                  <td style={{ padding:'12px 16px' }}>
                    {sub?<span className={sub.status==='active'?'badge-green':'badge-red'}>{sub.status} · {sub.plan}</span>:<span className="badge-gray">None</span>}
                  </td>
                  <td style={{ padding:'12px 16px',fontSize:13,color:'rgba(255,255,255,0.4)' }}>{formatDate(u.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!users||users.length===0)&&<div style={{ padding:'32px',textAlign:'center',color:'rgba(255,255,255,0.35)' }}>No users yet.</div>}
      </div>
    </div>
  );
}
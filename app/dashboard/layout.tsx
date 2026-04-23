import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#050a06' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'40px 48px', overflowY:'auto', maxWidth:'100%' }}>
        {children}
      </main>
    </div>
  );
}

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#050a06' }}>
      <AdminSidebar />
      <main style={{ flex:1, padding:'40px 48px', overflowY:'auto', maxWidth:'100%' }}>
        {children}
      </main>
    </div>
  );
}

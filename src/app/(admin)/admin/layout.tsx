import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavbar from '@/components/admin/AdminNavbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protección: Si no hay sesión, redirigir a login
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar userEmail={session.user.email || ''} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
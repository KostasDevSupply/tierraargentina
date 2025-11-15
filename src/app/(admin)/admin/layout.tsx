import '../../globals.css'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Admin - Tierra Argentina',
  description: 'Panel de administración',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // ✅ SIN <html> ni <body> - solo el contenido
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {session.user.email}
                </span>
                <a
                  href="/inicio"
                  target="_blank"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Ver sitio →
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  )
}
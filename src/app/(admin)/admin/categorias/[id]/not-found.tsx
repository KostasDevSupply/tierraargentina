import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Categoría no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La categoría que buscas no existe o fue eliminada
        </p>
        <Link
          href="/admin/categorias"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a categorías
        </Link>
      </div>
    </div>
  )
}
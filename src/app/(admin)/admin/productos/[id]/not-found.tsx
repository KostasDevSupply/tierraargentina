import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Producto no encontrado
        </h1>
        <p className="text-gray-600 mb-6">
          El producto que buscas no existe o fue eliminado
        </p>
        <Link
          href="/admin/productos"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a productos</span>
        </Link>
      </div>
    </div>
  )
}
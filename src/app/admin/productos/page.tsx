import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import DeleteProductButton from './DeleteProductButton'

export default async function ProductosPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      type:types(name, slug),
      sizes:product_sizes(size),
      images:product_images(id, url, is_primary)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar productos: {error.message}</p>
      </div>
    )
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">{products?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Productos Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {products?.filter(p => p.is_active).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Sin Imágenes</p>
          <p className="text-2xl font-bold text-amber-600">
            {products?.filter(p => !p.images || p.images.length === 0).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Destacados</p>
          <p className="text-2xl font-bold text-blue-600">
            {products?.filter(p => p.is_featured).length || 0}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Producto
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Categoría
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Precio
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Talles
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Fotos
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Creado
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Estado
    </th>
    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
      Acciones
    </th>
  </tr>
</thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {products && products.length > 0 ? (
    products.map((product) => (
      <tr key={product.id} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center">
            {/* REMOVIDO: thumbnail de imagen */}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {product.name}
              </div>
              <div className="text-sm text-gray-500">
                {product.type?.name || 'Sin tipo'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            {product.category?.name || 'Sin categoría'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.price > 0 
            ? `$${product.price.toLocaleString('es-AR')}`
            : 'Consultar'
          }
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {product.sizes?.length || 0} talles
        </td>
        {/* NUEVA COLUMNA: Número de imágenes */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-1">
            <span className={`text-sm ${product.images && product.images.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              {product.images?.length || 0}
            </span>
            <span className="text-xs text-gray-500">
              {product.images && product.images.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex flex-col">
            <span>{formatDate(product.created_at).split(',')[0]}</span>
            <span className="text-xs text-gray-400">
              {formatDate(product.created_at).split(',')[1]}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {product.is_active ? (
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Activo
            </span>
          ) : (
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              Inactivo
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <Link
              href={`/productos/${product.slug}`}
              target="_blank"
              className="text-gray-600 hover:text-gray-900"
              title="Ver en sitio público"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              href={`/admin/productos/${product.id}`}
              className="text-blue-600 hover:text-blue-900"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <DeleteProductButton
              productId={product.id}
              productName={product.name}
            />
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-4">No hay productos</p>
          <Link
            href="/admin/productos/nuevo"
            className="text-blue-600 hover:text-blue-700"
          >
            Crear primer producto
          </Link>
        </div>
      </td>
    </tr>
  )}
</tbody>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images.find(img => img.is_primary)?.url || product.images[0].url}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Sin img</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.type?.name || 'Sin tipo'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price > 0 
                        ? `$${product.price.toLocaleString('es-AR')}`
                        : 'Consultar'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sizes?.length || 0} talles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatDate(product.created_at).split(',')[0]}</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(product.created_at).split(',')[1]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.is_active ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/productos/${product.slug}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver en sitio público"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <p className="text-gray-500 mb-4">No hay productos</p>
                      <Link
                        href="/admin/productos/nuevo"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Crear primer producto
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

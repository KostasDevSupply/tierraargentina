import { createClient } from "../lib/supabase/client"

export default async function Home() {
  const supabase = await createClient()
  
  // Obtener productos con sus relaciones
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      type:types(name, slug),
      sizes:product_sizes(size)
    `)
    .order('created_at', { ascending: false })

  console.log('Products:', products)
  console.log('Error:', error)
  
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">
        🎉 Tierra Argentina
      </h1>
      <p className="text-gray-600 mb-8">Catálogo cargado exitosamente</p>
      
      <div className="bg-green-100 border border-green-400 rounded p-4 mb-8">
        <p className="text-green-800 font-semibold">
          ✅ Base de datos poblada: {products?.length || 0} productos
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 rounded p-4 mb-8">
          <p className="text-red-800 font-semibold">Error al cargar productos:</p>
          <p className="text-red-700 text-sm mt-2">{error.message}</p>
        </div>
      )}
      
      <h2 className="text-2xl font-semibold mb-4">Productos en el catálogo:</h2>
      
      {!products || products.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4">
          <p className="text-yellow-800">
            No hay productos en la base de datos.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            Ejecuta: <code className="bg-yellow-200 px-2 py-1 rounded font-mono">npm run seed</code>
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.category?.name} 
                    {product.type && ` → ${product.type.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {product.price > 0 
                      ? `$${product.price.toLocaleString('es-AR')}` 
                      : 'Consultar'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.sizes?.length || 0} talles
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {product.short_description || product.name}
              </p>
              {product.notes && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ {product.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
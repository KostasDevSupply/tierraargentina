'use client'

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, useWhatsAppMessage } from '@/lib/stores/cartStore'
import Image from 'next/image'

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart } =
    useCartStore()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const { generateMessage } = useWhatsAppMessage()

  const handleWhatsAppCheckout = () => {
    const message = generateMessage()
    const whatsappNumber = '+5491156308907' // ⚠️ CAMBIAR POR TU NÚMERO
    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tu Carrito</h2>
              <p className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                ¡Agregá productos para comenzar!
              </p>
              <button
                onClick={closeCart}
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="bg-gray-50 rounded-xl p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.size && (
                      <p className="text-sm text-gray-600 mb-2">
                        Talle: {item.size}
                      </p>
                    )}
                    <p className="text-lg font-bold text-pink-600">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-200 rounded-lg transition border border-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-200 rounded-lg transition border border-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="w-full text-red-500 hover:text-red-700 font-medium text-sm py-2 transition"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-gray-200 p-6 space-y-4 bg-gray-50">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="font-bold text-gray-900">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Enviar pedido por WhatsApp
            </button>

            <p className="text-xs text-center text-gray-500">
              Serás redirigido a WhatsApp para confirmar tu pedido
            </p>
          </div>
        )}
      </div>
    </>
  )
}
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

export function generateProductWhatsAppMessage(
  productName: string,
  productUrl: string,
  selectedSize?: string
): string {
  let message = `Hola! Me interesa el producto: ${productName}`
  if (selectedSize) {
    message += `\nTalle: ${selectedSize}`
  }
  message += `\nVer en: ${productUrl}`
  return message
}

export function generateCartWhatsAppMessage(
  items: Array<{
    name: string
    quantity: number
    size?: string | null
    price: number
  }>,
  total: number
): string {
  let message = 'Hola! 👋 Quiero realizar el siguiente pedido:\n\n'
  message += '📦 *PEDIDO*\n'
  message += '━━━━━━━━━━━━━━━━\n'

  items.forEach((item) => {
    message += `\n${item.quantity}x ${item.name}\n`
    if (item.size) {
      message += `   Talle: ${item.size}\n`
    }
    message += `   Precio: $${(item.price * item.quantity).toLocaleString('es-AR')}\n`
  })

  message += '\n━━━━━━━━━━━━━━━━\n'
  message += `💰 *TOTAL: $${total.toLocaleString('es-AR')}*\n\n`
  message += '¡Gracias! Quedo a la espera de la confirmación.'

  return message
}
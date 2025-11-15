import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react'

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-xl text-pink-100">
            Estamos para ayudarte. Consultá lo que necesites
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Cómo podemos ayudarte?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Estamos disponibles para responder tus consultas sobre productos, 
                talles, precios y cualquier otra duda que tengas.
              </p>
            </div>

            {/* Contact methods */}
            <div className="space-y-6">
                <a  
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 transition group"
              >
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-500 transition">
                  <Phone className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                  <p className="text-gray-600 mb-2">La forma más rápida de contactarnos</p>
                  <p className="text-green-600 font-semibold">+54 9 11 1234-5678</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600 mb-2">Envianos un correo</p>
                    <a
                     href="mailto:info@tierrargentina.com.ar"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    tierraargentina@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200">
                <div className="p-3 bg-white rounded-xl">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Ubicación</h3>
                  <p className="text-gray-600">
                    Buenos Aires, Argentina
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-gray-200">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Horarios</h3>
                  <p className="text-gray-600">
                    Lunes a Viernes: 9:00 - 18:00<br />
                    Sábados: 9:00 - 13:00
                  </p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Síguenos en redes</h3>
              <div className="flex gap-4">
                <div>
                  <a
                  href="#"
                  className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-pink-600 transition"
                >
                  <Instagram className="w-6 h-6 text-gray-700" />
                </a>
                </div>
                <div>
                  <a
                  href="#"
                  className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-pink-600 transition"
                >
                  <Facebook className="w-6 h-6 text-gray-700" />
                </a>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para hacer tu pedido?
              </h2>
              <p className="text-pink-100 text-lg mb-8">
                Contactanos por WhatsApp y te ayudamos a elegir el producto perfecto para vos.
              </p>
                <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl"
              >
                <Phone className="w-6 h-6" />
                Contactar ahora
              </a>

              <div className="mt-8 pt-8 border-t border-pink-500">
                <p className="text-sm text-pink-100">
                  Respondemos todas las consultas en menos de 24 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
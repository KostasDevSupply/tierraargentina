'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ProductsSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('buscar') || '')

  useEffect(() => {
    setSearchTerm(searchParams.get('buscar') || '')
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (searchTerm.trim()) {
      params.set('buscar', searchTerm.trim())
    } else {
      params.delete('buscar')
    }
    
    router.push(`/productos?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchTerm('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('buscar')
    router.push(`/productos?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-300" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos por nombre..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-white/20 focus:border-white focus:bg-white text-gray-900 placeholder-gray-400 transition-all shadow-xl focus:shadow-2xl outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>
    </form>
  )
}
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AnnouncementModal from './AnnouncementModal'

export default function NewAnnouncementButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        <Plus className="w-5 h-5" />
        Nuevo Anuncio
      </button>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
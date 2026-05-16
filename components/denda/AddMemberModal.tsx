'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import CartoonButton from '../CartoonButton'
import { X, UserPlus } from 'lucide-react'

interface AddMemberModalProps {
  onClose: () => void
  onComplete: () => void
  isEmbedded?: boolean
}

export default function AddMemberModal({ onClose, onComplete, isEmbedded }: AddMemberModalProps) {
  const [nama, setNama] = useState('')
  const [rt, setRt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !rt) return
    setLoading(true)

    const { error } = await supabase
      .from('members')
      .insert([{ nama, rt }])

    if (!error) {
      onComplete()
      onClose()
    } else {
      alert('Gagal menambah anggota: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className={isEmbedded ? "" : "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"}>
      <div className={isEmbedded ? "" : "cartoon-card w-full max-w-md bg-white p-6 relative animate-in fade-in slide-in-from-bottom-10"}>
        {!isEmbedded && (
          <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-zinc-100 rounded-full">
            <X size={24} />
          </button>
        )}

        <h2 className={`text-2xl font-black mb-1 ${isEmbedded ? 'hidden' : 'block'}`}>Tambah Anggota</h2>
        <p className={`font-bold opacity-60 mb-6 ${isEmbedded ? 'hidden' : 'block'}`}>Masukkan data pemuda/pemudi baru.</p>

        <form onSubmit={handleAdd} className="space-y-4 mb-8">
          <div>
            <label className="block font-black mb-2 uppercase text-xs tracking-widest">Nama Lengkap</label>
            <input 
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="cartoon-input w-full"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div>
            <label className="block font-black mb-2 uppercase text-xs tracking-widest">RT (Rukun Tetangga)</label>
            <input 
              type="text"
              value={rt}
              onChange={(e) => setRt(e.target.value)}
              className="cartoon-input w-full"
              placeholder="Contoh: 01"
              required
            />
          </div>

          <CartoonButton 
            type="submit"
            variant="accent" 
            className="w-full h-14 text-xl flex items-center justify-center gap-2 mt-4"
            disabled={loading || !nama || !rt}
          >
            {loading ? 'Menyimpan...' : (
              <>
                <UserPlus size={24} /> Simpan Anggota
              </>
            )}
          </CartoonButton>
        </form>
      </div>
    </div>
  )
}

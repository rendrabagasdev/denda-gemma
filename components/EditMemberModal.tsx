'use client'

import { useState } from 'react'
import { Member, Fine, supabase } from '@/lib/supabase'
import CartoonButton from './CartoonButton'
import { X, Save, PlusCircle, Trash2, Banknote } from 'lucide-react'

interface EditMemberModalProps {
  member: Member
  fines: Fine[]
  onClose: () => void
  onComplete: () => void
  isEmbedded?: boolean
}

export default function EditMemberModal({ member, fines, onClose, onComplete, isEmbedded }: EditMemberModalProps) {
  const [nama, setNama] = useState(member.nama)
  const [rt, setRt] = useState(member.rt)
  const [loading, setLoading] = useState(false)
  
  // For adding new fine
  const [newType, setNewType] = useState<'awal' | 'rapat' | 'kerjabakti'>('awal')
  const [newAmount, setNewAmount] = useState('')

  const handleUpdateMember = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('members')
      .update({ nama, rt })
      .eq('id', member.id)
    
    if (!error) onComplete()
    setLoading(false)
  }

  const handleAddFine = async () => {
    if (!newAmount) return
    setLoading(true)
    const { error } = await supabase
      .from('fines')
      .insert([{
        member_id: member.id,
        type: newType,
        amount: parseInt(newAmount),
        is_paid: false
      }])
    
    if (!error) {
      setNewAmount('')
      onComplete()
    }
    setLoading(false)
  }

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeleteFine = async (id: string) => {
    setLoading(true)
    await supabase.from('fines').delete().eq('id', id)
    onComplete()
    setConfirmDeleteId(null)
    setLoading(false)
  }

  return (
    <div className={isEmbedded ? "" : "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"}>
      <div className={isEmbedded ? "" : "cartoon-card w-full max-w-md bg-white p-6 relative animate-in fade-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto"}>
        {!isEmbedded && (
          <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-zinc-100 rounded-full">
            <X size={24} />
          </button>
        )}

        <h2 className={`text-2xl font-black mb-6 tracking-tight text-zinc-900 ${isEmbedded ? 'hidden' : 'block'}`}>Manajemen Denda</h2>
        <div className="mb-8">
          <p className="text-3xl font-black leading-tight tracking-tight text-zinc-900">{member.nama}</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">RT {member.rt}</p>
        </div>

        {/* Add New Fine */}
        <section className="mb-10">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-zinc-400">Tambah Denda Baru</h3>
          <div className="p-6 bg-zinc-50/50 rounded-[2rem] space-y-4 border border-zinc-100">
            <div className="grid grid-cols-3 gap-2">
              {(['awal', 'rapat', 'kerjabakti'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all ${
                    newType === t ? 'bg-primary border-primary shadow-lg shadow-primary/20 text-black' : 'bg-white border-zinc-100 text-zinc-400 shadow-sm'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-300">Rp</span>
              <input 
                type="number"
                className="cartoon-input w-full !pl-12 !py-4" 
                value={newAmount} 
                onChange={e => setNewAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <CartoonButton 
              variant="primary" 
              className="w-full py-4 shadow-xl shadow-primary/20 flex items-center justify-center gap-2" 
              onClick={handleAddFine} 
              disabled={loading || !newAmount}
            >
              <PlusCircle size={20} /> 
              <span>Tambah Denda</span>
            </CartoonButton>
          </div>
        </section>

        {/* List Fines */}
        <section>
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 text-zinc-400">Denda Belum Lunas</h3>
          <div className="space-y-3">
            {fines.filter(f => !f.is_paid).map(fine => (
              <div key={fine.id} className="flex justify-between items-center p-4 border border-zinc-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                {confirmDeleteId === fine.id ? (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                    <span className="text-[10px] font-bold uppercase text-secondary tracking-wider">Hapus denda?</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteFine(fine.id)}
                        className="px-4 py-2 bg-secondary text-white text-[10px] font-bold rounded-xl shadow-lg shadow-secondary/20"
                      >
                        YA
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-2 bg-zinc-100 text-[10px] font-bold rounded-xl text-zinc-500"
                      >
                        BATAL
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-50 rounded-xl">
                        <Banknote size={16} className="text-zinc-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{fine.type}</span>
                        <div className="font-black text-lg text-zinc-900 leading-none mt-1">Rp {fine.amount.toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                    <button onClick={() => setConfirmDeleteId(fine.id)} className="text-zinc-300 p-2 hover:text-secondary hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {fines.filter(f => !f.is_paid).length === 0 && (
              <div className="text-center py-12 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  Semua sudah lunas <PlusCircle size={14} className="text-success" />
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

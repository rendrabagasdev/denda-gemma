'use client'

import { useState } from 'react'
import { Member, Fine, supabase } from '@/lib/supabase'
import CartoonButton from './CartoonButton'
import { X, Banknote, CheckCircle2 } from 'lucide-react'

interface PaymentModalProps {
  member: Member
  fines: Fine[]
  onClose: () => void
  onComplete: () => void
  isEmbedded?: boolean
}

export default function PaymentModal({ member, fines, onClose, onComplete, isEmbedded }: PaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!amount) return
    setLoading(true)

    // 1. Record the payment
    const { error: pError } = await supabase.from('payments').insert({
      member_id: member.id,
      amount: parseInt(amount),
      categories: ['Pelunasan'] // General tag since categories are removed from UI
    })

    if (pError) {
      alert('Gagal mencatat pembayaran: ' + pError.message)
      setLoading(false)
      return
    }

    // 2. Mark ALL existing unpaid fines as paid
    await supabase
      .from('fines')
      .update({ is_paid: true })
      .eq('member_id', member.id)
      .eq('is_paid', false)

    onComplete()
    onClose()
    setLoading(false)
  }

  const unpaidTotal = fines
    .filter(f => !f.is_paid)
    .reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className={isEmbedded ? "" : "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"}>
      <div className={isEmbedded ? "" : "cartoon-card w-full max-w-md bg-white p-6 relative animate-in fade-in slide-in-from-bottom-10"}>
        {!isEmbedded && (
          <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-zinc-100 rounded-full">
            <X size={24} />
          </button>
        )}

        <h2 className={`text-2xl font-black mb-1 ${isEmbedded ? 'hidden' : 'block'}`}>Bayar Denda</h2>
        <p className={`font-bold opacity-60 mb-6 ${isEmbedded ? 'hidden' : 'block'}`}>{member.nama} - RT {member.rt}</p>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block font-black mb-2 uppercase text-xs tracking-widest">Nominal Bayar (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black opacity-30">Rp</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="cartoon-input w-full !pl-16 h-14 text-xl"
                placeholder="0"
              />
            </div>
            <p className="text-[10px] font-bold opacity-40 mt-2">
              Total Tunggakan: Rp {unpaidTotal.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 p-4 bg-yellow-50 rounded-2xl border-4 border-black border-dashed">
          <div className="flex items-center gap-2">
            <Banknote size={20} className="text-success" />
            <span className="font-black">Total:</span>
          </div>
          <span className="font-black text-2xl text-success">
            Rp {(parseInt(amount) || 0).toLocaleString('id-ID')}
          </span>
        </div>

        <CartoonButton 
          variant="success" 
          className="w-full h-14 text-xl flex items-center justify-center gap-2"
          onClick={handlePay}
          disabled={loading || !amount}
        >
          {loading ? 'Sabar ya...' : (
            <>
              Konfirmasi Bayar <CheckCircle2 size={24} />
            </>
          )}
        </CartoonButton>
      </div>
    </div>
  )
}

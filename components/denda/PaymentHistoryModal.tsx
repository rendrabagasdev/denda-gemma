'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, History, User, Banknote, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CartoonButton from '@/components/CartoonButton'

interface PaymentHistory {
  id: string
  amount: number
  created_at: string
  categories: string[]
  members: {
    nama: string
    rt: string
  }
}

interface PaymentHistoryModalProps {
  onClose: () => void
  isEmbedded?: boolean
}

export default function PaymentHistoryModal({ onClose, isEmbedded }: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        created_at,
        categories,
        members (
          nama,
          rt
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setPayments(data as any)
    }
    setLoading(false)
  }

  const content = (
    <>
      {!isEmbedded && (
        <div className="p-6 border-b-4 border-black flex items-center justify-between bg-primary/10">
          <div className="flex items-center gap-3">
            <History size={28} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Riwayat Pembayaran</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      )}

      <div className={`p-6 space-y-4 ${isEmbedded ? '' : 'flex-1 overflow-y-auto'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-8 border-black border-t-primary rounded-full animate-spin"></div>
            <p className="font-black animate-pulse">Memuat data...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Banknote size={64} className="mx-auto mb-4" />
            <p className="font-black text-xl">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="cartoon-card p-4 bg-white hover:bg-zinc-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <User size={18} className="text-success-dark" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-tight">{p.members?.nama}</h4>
                    <p className="text-xs font-bold opacity-50 uppercase">RT {p.members?.rt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-success">
                    +Rp {p.amount.toLocaleString('id-ID')}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-bold opacity-40 mt-1 uppercase">
                    <Calendar size={10} />
                    {new Date(p.created_at).toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {p.categories?.map(cat => (
                  <span key={cat} className="px-2 py-0.5 bg-black text-white text-[8px] font-black rounded uppercase">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-zinc-50 border-t-4 border-black text-center text-[10px] font-black opacity-30 uppercase tracking-widest">
        Menampilkan 50 transaksi terakhir
      </div>
    </>
  )

  if (isEmbedded) return content

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon-card w-full max-w-2xl bg-white max-h-[80vh] flex flex-col relative"
      >
        {content}
      </motion.div>
    </div>
  )
}

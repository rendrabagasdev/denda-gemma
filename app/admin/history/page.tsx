'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, History, User, Banknote, Calendar, Search } from 'lucide-react'
import { motion } from 'framer-motion'

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

export default function AdminHistoryPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) {
      router.push('/admin/login')
      return
    }
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

    if (!error && data) {
      setPayments(data as any)
    }
    setLoading(false)
  }

  const filteredPayments = payments.filter(p => 
    p.members?.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.members?.rt.includes(search)
  )

  return (
    <main className="max-w-md mx-auto h-[100dvh] flex flex-col bg-zinc-50/30 overflow-hidden relative">
      {/* Header Same as Admin */}
      <div className="p-6 pb-0 bg-transparent shrink-0">
        <header className="mb-4 flex justify-between items-start">
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight text-zinc-900">
            GEMMA<br/>
            <span className="text-success drop-shadow-sm">HISTORY</span>
          </h1>
          <button 
            onClick={() => router.push('/admin')}
            className="p-3 bg-white rounded-2xl shadow-cartoon-sm hover:bg-zinc-50 transition-colors border border-zinc-100"
          >
            <ArrowLeft size={20} />
          </button>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
          <input 
            type="text"
            placeholder="Cari transaksi..."
            className="cartoon-input w-full !pl-14 h-14 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Memuat Riwayat...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200 opacity-50">
            <History size={48} className="mx-auto mb-4 text-zinc-300" />
            <p className="font-bold text-sm text-zinc-400 uppercase">Belum ada transaksi</p>
          </div>
        ) : (
          filteredPayments.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="cartoon-card p-5 bg-white border border-zinc-100/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-2xl">
                    <User size={18} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-zinc-900 leading-tight">{p.members?.nama}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RT {p.members?.rt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-success">+Rp {p.amount.toLocaleString('id-ID')}</div>
                  <div className="flex items-center justify-end gap-1 text-[8px] font-bold text-zinc-300 uppercase mt-1">
                    <Calendar size={10} />
                    {new Date(p.created_at).toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {p.categories?.map(cat => (
                  <span key={cat} className="px-3 py-1 bg-zinc-50 text-zinc-400 text-[8px] font-bold rounded-full uppercase tracking-widest border border-zinc-100">
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </main>
  )
}

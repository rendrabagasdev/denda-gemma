'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'
import BottomBar from '@/components/BottomBar'
import { ArrowLeft, History, User, Banknote, Calendar, Search, Home } from 'lucide-react'
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
    <main className="min-h-dvh flex bg-zinc-50/30 overflow-hidden relative font-sans">
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-dvh overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden p-6 pb-0">
          <header className="mb-4 flex justify-between items-start">
            <h1 className="text-4xl font-black uppercase tracking-tight leading-none text-zinc-900">
              GEMMA<br/>
              <span className="text-red-300 drop-shadow-sm">HISTORY</span>
            </h1>
            <button 
              onClick={() => router.push('/admin')}
              className="p-3 bg-white rounded-2xl shadow-cartoon-sm border border-zinc-100"
            >
              <ArrowLeft size={20} />
            </button>
          </header>
        </div>

        {/* Shared Search Bar */}
        <div className="p-6 lg:p-10 pb-0">
          <div className="relative mb-8 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={20} />
            <input 
              type="text"
              placeholder="Cari transaksi..."
              className="cartoon-input w-full pl-16! h-16 text-lg bg-white shadow-sm border-zinc-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* History List Container */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-20 no-scrollbar">
          <div className="max-w-6xl">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPayments.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="cartoon-card p-6 bg-white border border-zinc-100/50 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-success/10 rounded-3xl">
                      <User size={20} className="text-success" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-zinc-900 leading-tight">{p.members?.nama}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">RT {p.members?.rt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-success">+Rp {p.amount.toLocaleString('id-ID')}</div>
                    <div className="flex items-center justify-end gap-1 text-[8px] font-bold text-zinc-300 uppercase mt-1">
                      <Calendar size={10} />
                      {new Date(p.created_at).toLocaleDateString('id-ID', { 
                        weekday: 'short',
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap pt-2 border-t border-zinc-50 mt-2">
                  {p.categories?.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-zinc-50 text-zinc-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-zinc-100">
                      {cat}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
          </div>
        </div>
      <BottomBar mode="admin" />
        </div>
    </main>
  )
}

function NavButton({ icon, label, onClick, active }: { icon: any, label: string, onClick: () => void, active: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
        active ? 'text-success' : 'text-zinc-400 hover:text-black'
      }`}
    >
      <div>{icon}</div>
      <span className="text-[9px] font-bold uppercase mt-1 leading-none tracking-tight">{label}</span>
    </button>
  )
}

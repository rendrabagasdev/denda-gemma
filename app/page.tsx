'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, Member, Fine } from '@/lib/supabase'
import MemberCard from '@/components/MemberCard'
import { Search, Trophy, Info, X, Banknote, Calendar, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GuestPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchData()

    // Realtime subscription
    const channel = supabase
      .channel('guest-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fines' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchData() {
    // 1. Try Cache First for Instant UI
    const cachedMembers = localStorage.getItem('cached_members')
    const cachedFines = localStorage.getItem('cached_fines')
    
    if (cachedMembers && cachedFines) {
      setMembers(JSON.parse(cachedMembers))
      setFines(JSON.parse(cachedFines))
      setLoading(false)
    } else {
      setLoading(true)
    }

    // 2. Fetch Fresh Data
    const { data: membersData } = await supabase.from('members').select('*')
    const { data: finesData } = await supabase.from('fines').select('*').eq('is_paid', false)
    
    if (membersData) {
      const sorted = [...membersData].sort((a, b) => {
        const rtA = parseInt(a.rt) || 0
        const rtB = parseInt(b.rt) || 0
        if (rtA !== rtB) return rtA - rtB
        return a.nama.localeCompare(b.nama)
      })
      setMembers(sorted)
      localStorage.setItem('cached_members', JSON.stringify(sorted))
    }
    
    if (finesData) {
      setFines(finesData)
      localStorage.setItem('cached_fines', JSON.stringify(finesData))
    }
    
    setLoading(false)
  }

  const filteredMembers = useMemo(() => 
    members.filter(m => {
      const matchesSearch = search ? (m.nama.toLowerCase().includes(search.toLowerCase()) || m.rt.includes(search)) : false
      return matchesSearch
    }),
    [members, search]
  )

  const TikTokModal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title?: string }) => (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative max-h-[95vh] flex flex-col border-t border-zinc-50"
      >
        <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-6 shrink-0" />
        <div className="flex justify-between items-center mb-6 shrink-0">
          {title && <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">{title}</h2>}
          <button onClick={onClose} className="ml-auto p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={24} className="text-zinc-400" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  )

  return (
    <main className="max-w-md mx-auto h-[100dvh] flex flex-col bg-cartoon-bg overflow-hidden relative">
      <div className="p-6 pb-2">
        {/* Modern Playful Header */}
        <header className="mb-10 text-center pt-4">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-block p-4 bg-primary rounded-[2rem] mb-4 shadow-[0_15px_30px_rgba(255,214,10,0.4)]"
          >
            <Trophy size={40} className="text-black" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-zinc-900">Denda Gemma</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">Organisasi Pemuda Pemudi</p>
        </header>

        {/* Search Bar with Modern Playful Style */}
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <Search className="text-black/40" size={20} />
          </div>
          <input 
            type="text"
            placeholder="Ketik namamu..."
            className="cartoon-input w-full !pl-16 h-14 text-lg shadow-cartoon-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-4 no-scrollbar">
        {!search ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Search size={48} className="mb-4" />
            <p className="font-black text-sm uppercase italic">Cari namamu dulu, Lur!</p>
          </div>
        ) : loading ? (
          <div className="text-center py-20 font-black animate-pulse uppercase text-xs">Memuat data...</div>
        ) : filteredMembers.length > 0 ? (
          <AnimatePresence>
            {filteredMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MemberCard 
                  member={member} 
                  fines={fines.filter(f => f.member_id === member.id)} 
                  onClick={() => {
                    setSelectedMember(member)
                    setIsDetailOpen(true)
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="cartoon-card p-10 text-center bg-white/50 border-dashed border-4 opacity-50">
            <p className="font-black text-lg">Jenengmu ora ono.</p>
            <p className="text-xs font-bold uppercase mt-2">Cek maneh ejaane.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDetailOpen && selectedMember && (
          <TikTokModal title="Rincian Denda" onClose={() => setIsDetailOpen(false)}>
            <div className="mb-8">
              <p className="text-3xl font-black text-zinc-900 tracking-tight">{selectedMember.nama}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">RT {selectedMember.rt}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Tunggakan Belum Lunas</h3>
              {fines.filter(f => f.member_id === selectedMember.id).length > 0 ? (
                fines.filter(f => f.member_id === selectedMember.id).map((fine) => (
                  <div key={fine.id} className="cartoon-card p-5 bg-white border border-zinc-100/50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-50 rounded-2xl">
                        <Banknote size={20} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{fine.type}</p>
                        <p className="text-lg font-black text-zinc-900 mt-1">Rp {fine.amount.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">Mantap, semua sudah lunas!</p>
                </div>
              )}
            </div>

            <div className="mt-10 p-6 bg-primary/10 rounded-[2rem] border border-primary/20">
              <p className="text-xs font-bold text-primary-dark/60 uppercase tracking-widest text-center mb-1">Total yang harus dibayar</p>
              <p className="text-3xl font-black text-center text-zinc-900">
                Rp {fines.filter(f => f.member_id === selectedMember.id).reduce((s, f) => s + f.amount, 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] font-bold text-zinc-400 text-center mt-4 uppercase leading-relaxed">
                Silakan hubungi pengurus RT untuk melakukan pembayaran.
              </p>
            </div>
          </TikTokModal>
        )}
      </AnimatePresence>
    </main>
  )
}

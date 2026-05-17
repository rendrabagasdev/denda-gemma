'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, Member, Fine } from '@/lib/supabase'
import MemberCard from '@/components/denda/MemberCard'
import { Search, Trophy, Info, X, Banknote, Calendar, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDashboardData } from '@/app/actions/denda'

export default function GuestPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

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
    setLoading(true)
    
    // Optimized: Single call for all data
    const { members: membersData, fines: finesData } = await getDashboardData()

    if (membersData) {
      const sorted = [...membersData].sort((a, b) => {
        const rtA = parseInt(a.rt) || 0
        const rtB = parseInt(b.rt) || 0
        if (rtA !== rtB) return rtA - rtB
        return a.nama.localeCompare(b.nama)
      })
      setMembers(sorted)
    }
    
    if (finesData) {
      // For guest, we usually only care about unpaid fines
      setFines(finesData.filter(f => !f.is_paid))
    }
    
    setLoading(false)
  }

  const filteredMembers = useMemo(() => 
    members.filter(m => {
      const matchesSearch = debouncedSearch ? (m.nama.toLowerCase().includes(debouncedSearch.toLowerCase()) || m.rt.includes(debouncedSearch)) : false
      return matchesSearch
    }),
    [members, debouncedSearch]
  )

  const TikTokModal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title?: string }) => (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-end lg:items-center justify-center bg-black/40 lg:p-6"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full lg:max-w-2xl bg-white rounded-t-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] lg:shadow-[0_40px_100px_rgba(0,0,0,0.25)] relative max-h-[85vh] lg:max-h-[85vh] flex flex-col border-t lg:border border-zinc-100 will-change-transform"
      >
        <div className="w-12 h-1.5 bg-zinc-100 rounded-full mx-auto mb-8 shrink-0 lg:hidden" />
        <div className="overflow-y-auto no-scrollbar flex-1 pb-10">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-10 shrink-0">
              {title && <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{title}</h2>}
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-zinc-50 rounded-full transition-colors group"
              >
                <X size={24} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )

  return (
    <main className="min-h-dvh flex flex-col bg-zinc-50/30 overflow-hidden relative font-sans">
      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-160 h-160 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-120 h-120 bg-secondary/5 rounded-full blur-[120px] -z-10" />

      {/* Header Shared Responsive */}
      <div className="p-6 lg:p-12 pb-0 shrink-0">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-tight text-zinc-900">
              <img src="/logo-gemma.svg" alt="Logo Gemma" className="w-60 h-60 mx-auto relative -top-10  lg:w-40 lg:h-40 lg:relative lg:-top-10 lg:mx-0 lg:-left-5  " />
            </h1>
            <p className="text-[10px] lg:text-xs font-bold text-zinc-400 lg:mt-4 uppercase tracking-[0.25em] relative -top-20 text-center lg:text-left">Gerakan Masyarakat Muda Mudi <br/> Dusun Tobratan</p>
          </div>

          <div className="relative w-full lg:max-w-4xl -top-20">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={22} />
            <input 
              type="text"
              placeholder="Golek i jenengmu..."
              className="cartoon-input w-full pl-16! h-16 text-lg bg-white shadow-xl shadow-black/5 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>
      </div>

      {/* Content Area Responsive */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 pb-20 no-scrollbar relative -top-20">
        {!search ? (
          <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl mb-6">
              <Search size={40} className="text-zinc-200" />
            </div>
            <h2 className="text-xl font-black uppercase text-zinc-900">Golek i Jenengmu</h2>
            <p className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-widest">Ketik jenengmu ing dhuwur kanggo cek denda</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-[0.2em]">Sabar sek, Lur...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            <AnimatePresence>
              {filteredMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
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
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 bg-white/50 rounded-[3rem] border-4 border-dashed border-zinc-100 p-10">
            <p className="font-black text-xl text-zinc-400">Jenengmu ora ono, Lur!</p>
            <p className="text-xs font-bold uppercase mt-4 text-zinc-300 tracking-widest">Cek maneh ejaane utawa hubungi RT</p>
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
                        {fine.created_at && (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-300 uppercase mt-2 tracking-tighter">
                            <Calendar size={10} />
                            {new Date(fine.created_at).toLocaleDateString('id-ID', { 
                              weekday: 'long', 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        )}
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
                Silakan hubungi Ketua GEMMA untuk melakukan pembayaran.
              </p>
            </div>
          </TikTokModal>
        )}
      </AnimatePresence>
    </main>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Member, Fine } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'
import { Search, Plus, UserPlus, LogOut, Wallet, Edit3, Trash2, X, Download, History, Home, FileSpreadsheet } from 'lucide-react'
import CartoonButton from '@/components/CartoonButton'
import ImportExcel from '@/components/denda/ImportExcel'
import PaymentModal from '@/components/denda/PaymentModal'
import EditMemberModal from '@/components/denda/EditMemberModal'
import MemberCard from '@/components/denda/MemberCard'
import AddMemberModal from '@/components/denda/AddMemberModal'
import ExportData from '@/components/denda/ExportData'
import PaymentHistoryModal from '@/components/denda/PaymentHistoryModal'
import ConfirmModal from '@/components/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import { getDashboardData, invalidateMembersCache, invalidateFinesCache } from '@/app/actions/denda'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [activeModal, setActiveModal] = useState<'payment' | 'edit' | 'import' | 'add_member' | 'export' | 'history' | null>(null)

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      } else {
        fetchData()
      }
    }
    
    checkUser()

    // Realtime subscription
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => {
          fetchData()
          invalidateMembersCache()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fines' },
        () => {
          fetchData()
          invalidateFinesCache()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchData()
          invalidateFinesCache()
          invalidateMembersCache()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const [selectedRT, setSelectedRT] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    
    // Optimized: Single call for all data via Redis Pipeline
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
      setFines(finesData)
    }
    
    setLoading(false)
  }

  const allRTs = useMemo(() => 
    Array.from(new Set(members.map(m => m.rt))).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0)),
    [members]
  )

  const filteredMembers = useMemo(() => 
    members.filter(m => {
      const matchesSearch = m.nama.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesRT = selectedRT ? m.rt === selectedRT : true
      return matchesSearch && matchesRT
    }),
    [members, debouncedSearch, selectedRT]
  )

  const handleAction = (member: Member, action: 'payment' | 'edit') => {
    setSelectedMember(member)
    setActiveModal(action)
  }

  const handleLogout = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Logout?',
      message: 'Kamu akan keluar dari panel admin. Lanjutkan?',
      onConfirm: () => {
        localStorage.removeItem('admin_auth')
        router.push('/admin/login')
      }
    })
  }


  const TikTokModal = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title?: string }) => (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-60 flex items-end lg:items-center justify-center bg-black/40 p-4 lg:p-6"
    >
      <motion.div 
        initial={{ y: "20%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "20%", opacity: 0 }}
        transition={{ type: 'tween', ease: "easeOut", duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full lg:max-w-2xl bg-white rounded-t-[3rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-[0_-20px_80px_rgba(0,0,0,0.2)] lg:shadow-[0_40px_100px_rgba(0,0,0,0.25)] relative max-h-[60vh] lg:max-h-[85vh] flex flex-col border-t lg:border border-zinc-100 will-change-transform"
      >
        <div className="w-16 h-1.5 bg-zinc-100 rounded-full mx-auto mb-10 shrink-0 lg:hidden" />
        <div className="overflow-y-auto no-scrollbar flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-10 shrink-0">
              {title && <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">{title}</h2>}
              <button 
                onClick={onClose} 
                className="p-3 bg-zinc-50 text-zinc-400 rounded-2xl hover:bg-zinc-100 transition-colors"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )

  const SidebarButton = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
        active ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </button>
  )

  return (
    <main className="min-h-dvh flex bg-zinc-50/30 overflow-hidden relative font-sans">
      <AdminSidebar onAction={setActiveModal} activeAction={activeModal} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-dvh overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden p-6 pb-0">
          <header className="mb-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight text-zinc-900">
              GEMMA<br/>
              <span className="text-[#ffdc00] drop-shadow-sm">ADMIN</span>
            </h1>
          </header>
        </div>

        {/* Search & Filter Section */}
        <div className="p-6 lg:p-10 pb-2">
          <div className="max-w-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={20} />
              <input 
                type="text"
                placeholder="Cari anggota atau RT..."
                className="cartoon-input w-full pl-16! h-16 text-lg bg-white shadow-sm border-zinc-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* RT Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['SEMUA', '3', '4', '5', '6'].map((rtFilter) => (
                <button
                  key={rtFilter}
                  onClick={() => setSelectedRT(rtFilter === 'SEMUA' ? null : rtFilter)}
                  className={`px-6 py-2.5 rounded-full border-2 font-black text-[10px] uppercase tracking-wider transition-all shrink-0 ${
                    ((rtFilter === 'SEMUA' && !selectedRT) || selectedRT === rtFilter)
                      ? 'bg-[#ffdc00] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  {rtFilter === 'SEMUA' ? 'SEMUA RT' : `RT ${rtFilter}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-20 no-scrollbar">
          <div className="max-w-6xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-[0.2em]">Memuat Data...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
              <p className="font-bold text-zinc-300 uppercase tracking-widest">Data tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
              {filteredMembers.map(member => {
                const mFines = fines.filter(f => f.member_id === member.id && !f.is_paid)
                return (
                  <div key={member.id} className="group">
                    <MemberCard 
                      member={member} 
                      fines={mFines} 
                      onClick={() => handleAction(member, 'payment')}
                    >
                      <div className="flex flex-wrap gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform lg:translate-y-2 lg:group-hover:translate-y-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(member, 'payment'); }}
                          className="flex-1 min-w-[80px] bg-[#22c55e] text-black h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm active:scale-95"
                        >
                          <Wallet size={16} strokeWidth={2.5} />
                          <span>Bayar</span>
                        </button>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAction(member, 'edit'); }}
                          className="flex-1 min-w-[80px] bg-[#ffdc00] text-black h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm active:scale-95"
                        >
                          <Edit3 size={16} strokeWidth={2.5} />
                          <span>Edit</span>
                        </button>


                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Hapus Anggota?',
                              message: `Hapus ${member.nama} secara permanen?`,
                              type: 'danger',
                              onConfirm: async () => {
                                await supabase.from('members').delete().eq('id', member.id)
                                fetchData()
                                setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                              }
                            })
                          }}
                          className="bg-white text-[#ff4b4b] h-12 w-12 rounded-2xl border-[3px] border-zinc-100 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm active:scale-95 shrink-0"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </MemberCard>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav (Hidden on Desktop) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center bg-linear-to-t from-white/80 to-transparent">
        <div className="bg-white text-black rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-1 w-[94%] max-w-sm justify-between border border-white">
          <NavButton 
            icon={<History size={20} />} 
            label="History" 
            active={false} 
            onClick={() => router.push('/admin/history')} 
          />
          <NavButton 
            icon={<Download size={20} />} 
            label="Import" 
            active={activeModal === 'import'} 
            onClick={() => setActiveModal('import')} 
          />
          
          {/* Modern Floating ADD Button */}
          <button 
            onClick={() => setActiveModal('add_member')}
            className={`w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_10px_20px_rgba(255,214,10,0.4)] transform -translate-y-6 active:scale-90 transition-all ${activeModal === 'add_member' ? 'rotate-45' : ''}`}
          >
            <Plus size={32} className="text-black" strokeWidth={3} />
          </button>

          <NavButton 
            icon={<FileSpreadsheet size={20} />} 
            label="Export" 
            active={activeModal === 'export'} 
            onClick={() => setActiveModal('export')} 
          />
          <NavButton 
            icon={<LogOut size={20} />} 
            label="Logout" 
            active={false} 
            onClick={handleLogout} 
          />
        </div>
      </nav>

      <AnimatePresence>
        {activeModal === 'import' && (
          <TikTokModal title="Import Data" onClose={() => setActiveModal(null)}>
            <ImportExcel onComplete={() => { fetchData(); setActiveModal(null); }} />
          </TikTokModal>
        )}

        {activeModal === 'export' && (
          <TikTokModal title="Export Excel" onClose={() => setActiveModal(null)}>
            <div className="cartoon-card bg-zinc-50 p-6 border-dashed">
              <ExportData data={members} fines={fines} />
              <p className="mt-4 text-[10px] font-bold opacity-50 text-center uppercase tracking-widest">Siap diunduh sebagai .xlsx</p>
            </div>
          </TikTokModal>
        )}

        {activeModal === 'add_member' && (
          <TikTokModal title="Tambah Anggota" onClose={() => setActiveModal(null)}>
             <AddMemberModal 
                onClose={() => setActiveModal(null)}
                onComplete={fetchData}
                isEmbedded={true} 
              />
          </TikTokModal>
        )}

        {activeModal === 'payment' && selectedMember && (
          <TikTokModal title="Konfirmasi Bayar" onClose={() => setActiveModal(null)}>
            <PaymentModal 
              member={selectedMember} 
              fines={fines.filter(f => f.member_id === selectedMember.id)}
              onClose={() => setActiveModal(null)}
              onComplete={fetchData}
              isEmbedded={true}
            />
          </TikTokModal>
        )}

        {activeModal === 'edit' && selectedMember && (
          <TikTokModal title="Manajemen Denda" onClose={() => setActiveModal(null)}>
            <EditMemberModal 
              member={selectedMember} 
              fines={fines.filter(f => f.member_id === selectedMember.id)}
              onClose={() => setActiveModal(null)}
              onComplete={() => {
                fetchData();
                // Optionally close here if desired, but we'll let EditMemberModal handle its own closing for specific actions
              }}
              isEmbedded={true}
            />
          </TikTokModal>
        )}
      </AnimatePresence>
      <ConfirmModal 
        {...confirmConfig}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
        </div>
    </main>
  )
}

function NavButton({ icon, label, onClick, active }: { icon: any, label: string, onClick: () => void, active: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
        active ? 'text-secondary' : 'text-zinc-400 hover:text-black'
      }`}
    >
      <div>{icon}</div>
      <span className="text-[9px] font-bold uppercase mt-1 leading-none tracking-tight">{label}</span>
    </button>
  )
}


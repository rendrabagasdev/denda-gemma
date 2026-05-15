'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Member, Fine } from '@/lib/supabase'
import { Search, Plus, UserPlus, LogOut, Wallet, Edit3, Trash2, X, Download, History, Home, FileSpreadsheet } from 'lucide-react'
import CartoonButton from '@/components/CartoonButton'
import ImportExcel from '@/components/ImportExcel'
import PaymentModal from '@/components/PaymentModal'
import EditMemberModal from '@/components/EditMemberModal'
import AddMemberModal from '@/components/AddMemberModal'
import ExportData from '@/components/ExportData'
import PaymentHistoryModal from '@/components/PaymentHistoryModal'
import ConfirmModal from '@/components/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
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
    const auth = localStorage.getItem('admin_auth')
    if (!auth) {
      router.push('/admin/login')
      return
    }
    
    fetchData()

    // Realtime subscription
    const channel = supabase
      .channel('admin-realtime')
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

  const [selectedRT, setSelectedRT] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: membersData } = await supabase.from('members').select('*')
    const { data: finesData } = await supabase.from('fines').select('*')
    
    if (membersData) {
      // Sort by RT (numeric) then Nama
      const sorted = [...membersData].sort((a, b) => {
        const rtA = parseInt(a.rt) || 0
        const rtB = parseInt(b.rt) || 0
        if (rtA !== rtB) return rtA - rtB
        return a.nama.localeCompare(b.nama)
      })
      setMembers(sorted)
    }
    if (finesData) setFines(finesData)
    setLoading(false)
  }

  const allRTs = Array.from(new Set(members.map(m => m.rt))).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0))

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.nama.toLowerCase().includes(search.toLowerCase()) || m.rt.includes(search)
    const matchesRT = selectedRT ? m.rt === selectedRT : true
    return matchesSearch && matchesRT
  })

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative max-h-[95vh] flex flex-col border-t border-zinc-50"
      >
        <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6 shrink-0" />
        <div className="flex justify-between items-center mb-6 shrink-0">
          {title && <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>}
          <button onClick={onClose} className="ml-auto p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  )

  return (
    <main className="max-w-md mx-auto h-[100dvh] flex flex-col bg-zinc-50/30 overflow-hidden relative">
      <div className="p-6 pb-0">
        <header className="mb-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight text-zinc-900">
            GEMMA<br/>
            <span className="text-primary drop-shadow-sm">ADMIN</span>
          </h1>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/40" size={20} />
          <input 
            type="text"
            placeholder="Cari anggota atau RT..."
            className="cartoon-input w-full !pl-16 h-14 text-lg shadow-cartoon-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* RT Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setSelectedRT(null)}
            className={`px-4 py-1.5 rounded-full border-2 border-black font-black text-[10px] uppercase transition-all whitespace-nowrap ${!selectedRT ? 'bg-black text-white' : 'bg-white text-black'}`}
          >
            Semua RT
          </button>
          {allRTs.map(rt => (
            <button 
              key={rt}
              onClick={() => setSelectedRT(rt)}
              className={`px-4 py-1.5 rounded-full border-2 border-black font-black text-[10px] uppercase transition-all whitespace-nowrap ${selectedRT === rt ? 'bg-primary text-black' : 'bg-white text-black'}`}
            >
              RT {rt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-black border-t-primary rounded-full animate-spin"></div>
            <p className="font-black opacity-40 uppercase text-xs">Sing sabar...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-4 border-black border-dashed opacity-40">
            <p className="font-black italic">Ora nemu data, Lur!</p>
          </div>
        ) : filteredMembers.map((member) => {
          const mFines = fines.filter(f => f.member_id === member.id && !f.is_paid)
          const total = mFines.reduce((s, f) => s + f.amount, 0)
          
          return (
            <div key={member.id} className="cartoon-card p-5 bg-white group hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors">{member.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded uppercase">RT {member.rt}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Tunggakan</p>
                  <p className={`font-black text-xl ${total > 0 ? 'text-secondary' : 'text-success'}`}>
                    Rp {total.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <CartoonButton 
                  variant="success" 
                  className="flex-1 text-[10px] py-3 px-0 flex items-center justify-center gap-2"
                  onClick={() => handleAction(member, 'payment')}
                >
                  <Wallet size={16} /> BAYAR
                </CartoonButton>
                <CartoonButton 
                  variant="primary" 
                  className="flex-1 text-[10px] py-3 px-0 flex items-center justify-center gap-2"
                  onClick={() => handleAction(member, 'edit')}
                >
                  <Edit3 size={16} /> EDIT
                </CartoonButton>
                <button 
                  className="p-3 border-4 border-black rounded-2xl bg-white hover:bg-red-50 text-red-500 shadow-cartoon-sm active:translate-y-1 transition-all"
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: 'Hapus Anggota?',
                      message: `Hapus ${member.nama} secara permanen? Seluruh data denda akan hilang.`,
                      type: 'danger',
                      onConfirm: async () => {
                        await supabase.from('members').delete().eq('id', member.id)
                        fetchData()
                        setConfirmConfig(prev => ({ ...prev, isOpen: false }))
                      }
                    })
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modern Playful Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center bg-gradient-to-t from-white/80 to-transparent">
        <div className="bg-white/90 backdrop-blur-xl text-black rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-1 w-[94%] max-w-sm justify-between border border-white">
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
              onComplete={fetchData}
              isEmbedded={true}
            />
          </TikTokModal>
        )}
      </AnimatePresence>
      <ConfirmModal 
        {...confirmConfig}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
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


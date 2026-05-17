'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Member, Division } from '@/lib/supabase'
import { getDashboardData, getDivisions } from '@/app/actions/denda'
import AdminSidebar from '@/components/AdminSidebar'
import BottomBar from '@/components/BottomBar'
import { Search, Plus, Edit2, Trash2, CheckCircle2, Users, ChevronDown, X, Save, UserPlus, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function AnggotaDendaPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [allDivisions, setAllDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Filter States
  const [filterRT, setFilterRT] = useState<string>('all')
  const [filterDivisi, setFilterDivisi] = useState<string>('all')
  const [filterJabatan, setFilterJabatan] = useState<string>('all')

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    rt: '',
    division_id: '',
    jabatan: 'Anggota'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { members: mData } = await getDashboardData()
    const dData = await getDivisions()
    if (mData) setMembers(mData)
    if (dData) setAllDivisions(dData)
    setLoading(false)
  }

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        nama: member.nama,
        rt: member.rt,
        division_id: member.division_id || '',
        jabatan: member.jabatan || 'Anggota'
      })
    } else {
      setEditingMember(null)
      setFormData({ 
        nama: '', 
        rt: '', 
        division_id: '', 
        jabatan: 'Anggota' 
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nama || !formData.rt) {
      toast.error('Nama dan RT wajib diisi!')
      return
    }

    // Normalisasi RT: '03' -> '3', '04' -> '4'
    const parsedRT = parseInt(formData.rt, 10)
    const normalizedRT = isNaN(parsedRT) ? formData.rt : parsedRT.toString()

    // Fix: Convert empty string to null for UUID field
    const dataToSubmit = {
      ...formData,
      rt: normalizedRT,
      division_id: formData.division_id || null
    }

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update(dataToSubmit)
          .eq('id', editingMember.id)
        if (error) throw error
        toast.success('Data warga berhasil diperbarui!')
      } else {
        const { error } = await supabase
          .from('members')
          .insert([dataToSubmit])
        if (error) throw error
        toast.success('Warga baru berhasil ditambahkan!')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      toast.error('Gagal menyimpan data: ' + (err.message || 'Terjadi kesalahan'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data warga ini? Seluruh data denda dan pembayaran terkait juga akan terhapus.')) return
    try {
      // Delete associated data first (Cascade delete manual)
      await supabase.from('fines').delete().eq('member_id', id)
      await supabase.from('payments').delete().eq('member_id', id)
      
      const { error } = await supabase.from('members').delete().eq('id', id)
      if (error) throw error
      toast.success('Data warga berhasil dihapus.')
      fetchData()
    } catch (err: any) {
      console.error(err)
      toast.error('Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan'))
    }
  }

  // Helper untuk normalisasi RT
  const getNormalizedRT = (rt: string) => {
    if (!rt) return ''
    const parsed = parseInt(rt, 10)
    return isNaN(parsed) ? rt : parsed.toString()
  }

  // Filter Logic
  const uniqueRTs = useMemo(() => {
    const normalized = members.map(m => getNormalizedRT(m.rt))
    return Array.from(new Set(normalized)).sort((a, b) => {
      const numA = parseInt(a, 10) || 0
      const numB = parseInt(b, 10) || 0
      return numA - numB || a.localeCompare(b)
    })
  }, [members])

  const uniqueDivisis = useMemo(() => Array.from(new Set(members.map(m => m.divisi || '-'))).sort(), [members])
  const uniqueJabatans = useMemo(() => Array.from(new Set(members.map(m => m.jabatan || 'Anggota'))).sort(), [members])

  const filteredMembers = useMemo(() => {
    return members
      .filter(m => {
        const normRT = getNormalizedRT(m.rt)
        const matchesSearch = m.nama.toLowerCase().includes(search.toLowerCase()) || 
                             normRT.toLowerCase().includes(search.toLowerCase())
        const matchesRT = filterRT === 'all' || normRT === filterRT
        const matchesDivisi = filterDivisi === 'all' || (m.divisi || '-') === filterDivisi
        const matchesJabatan = filterJabatan === 'all' || (m.jabatan || 'Anggota') === filterJabatan
        return matchesSearch && matchesRT && matchesDivisi && matchesJabatan
      })
      .sort((a, b) => {
        const rtA = parseInt(a.rt) || 0
        const rtB = parseInt(b.rt) || 0
        if (rtA !== rtB) return rtA - rtB
        return a.nama.localeCompare(b.nama)
      })
  }, [members, search, filterRT, filterDivisi, filterJabatan])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AdminSidebar mode="denda" />
      
      <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Manajemen Anggota</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kelola data warga untuk sistem Denda</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="cartoon-btn bg-primary  px-8 h-14 flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl shadow-[#ffdc00]/20 text-white"
            >
              <UserPlus size={20} /> Tambah Anggota
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={20} />
              <input 
                type="text"
                placeholder="Cari nama atau RT..."
                className="cartoon-input w-full pl-16! h-14 text-sm bg-white shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative group">
              <select 
                value={filterRT}
                onChange={(e) => setFilterRT(e.target.value)}
                className="cartoon-input h-14 px-6 w-full text-[10px] font-black uppercase tracking-widest bg-white cursor-pointer appearance-none outline-none"
              >
                <option value="all">Semua RT</option>
                {uniqueRTs.map(rt => <option key={rt} value={rt}>RT {rt}</option>)}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={18} />
            </div>

            <div className="bg-white px-6 h-14 rounded-2xl border-2 border-zinc-100 flex items-center gap-3">
              <Users className="text-zinc-400" size={18} />
              <span className="font-black text-[10px] uppercase tracking-widest text-zinc-600">{filteredMembers.length} Orang</span>
            </div>
          </div>

          {/* Members Table */}
          <div className="cartoon-card bg-white p-0 overflow-hidden mb-20">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Memuat Data...</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50/50 border-b-2 border-zinc-100">
                      <tr>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Nama Lengkap</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">RT</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Sie / Divisi</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Jabatan</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-xs text-zinc-400">
                                {member.nama.charAt(0)}
                              </div>
                              <span className="font-bold text-zinc-900">{member.nama}</span>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <span className="px-3 py-1 bg-zinc-100 rounded-full font-black text-[10px] text-zinc-500">RT {getNormalizedRT(member.rt)}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{member.divisi || '-'}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{member.jabatan || 'Anggota'}</span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleOpenModal(member)}
                                className="p-2 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(member.id)}
                                className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-zinc-50">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="p-4 flex items-center gap-4 active:bg-zinc-50 transition-colors">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-xs text-zinc-400 shrink-0">
                        {member.nama.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">{member.nama}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase text-zinc-400">RT {getNormalizedRT(member.rt)}</span>
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 rounded-full">{member.jabatan}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleOpenModal(member)} className="p-2 text-zinc-400"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(member.id)} className="p-2 text-red-300"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMembers.length === 0 && (
                  <div className="py-20 text-center">
                    <Users className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest text-zinc-400">Tidak ada data warga</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="cartoon-card bg-white w-full max-w-md p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 p-2 bg-zinc-50 text-zinc-400 rounded-xl hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#ffdc00]/10 rounded-2xl">
                  <UserPlus size={24} className="text-[#ffdc00]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">
                    {editingMember ? 'Edit Data Warga' : 'Tambah Warga Baru'}
                  </h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Informasi Struktural & RT</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nama Lengkap</label>
                  <input 
                    type="text"
                    required
                    className="cartoon-input w-full h-12 text-sm"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">RT (Angka)</label>
                    <input 
                      type="text"
                      required
                      className="cartoon-input w-full h-12 text-sm"
                      value={formData.rt}
                      onChange={(e) => setFormData({...formData, rt: e.target.value})}
                      placeholder="Contoh: 01"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Jabatan</label>
                    <select 
                      className="cartoon-input w-full h-12 text-sm bg-white"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                    >
                      <option value="Anggota">Anggota</option>
                      <option value="Ketua">Ketua</option>
                      <option value="Wakil Ketua">Wakil Ketua</option>
                      <option value="Sekretaris">Sekretaris</option>
                      <option value="Bendahara">Bendahara</option>
                      <option value="Koordinator">Koordinator</option>
                      <option value="Penasihat">Penasihat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Sie / Divisi</label>
                  <div className="relative group">
                    <select 
                      className="cartoon-input w-full h-12 text-sm bg-white cursor-pointer appearance-none outline-none"
                      value={formData.division_id}
                      onChange={(e) => setFormData({...formData, division_id: e.target.value})}
                    >
                      <option value="">Pilih Sie / Divisi</option>
                      {allDivisions.map(div => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={16} />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="cartoon-btn bg-[#ffdc00] h-16 w-full flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-[#ffdc00]/20 text-black"
                  >
                    <Save size={20} /> Simpan Data Warga
                  </button>
                  <div className="flex items-center gap-2 justify-center text-zinc-400">
                    <Info size={12} />
                    <p className="text-[9px] font-bold uppercase tracking-widest">
                      Data akan otomatis disinkronkan ke modul Undangan
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BottomBar mode="admin" />
    </div>
  )
}

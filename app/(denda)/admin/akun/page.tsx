'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'
import { Shield, Key, Mail, User, Save, Lock, Info, LogOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function AkunDendaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok!')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter!')
      return
    }

    setIsUpdating(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password berhasil diperbarui!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setIsUpdating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AdminSidebar mode="denda" />
      
      <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Kelola Akun Admin</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pengaturan keamanan sistem denda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="cartoon-card bg-white p-6 text-center">
                <div className="w-20 h-20 bg-[#ffdc00]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#ffdc00]/20">
                  <User size={40} className="text-[#ffdc00]" />
                </div>
                <h3 className="font-bold text-slate-900 truncate">{user?.email}</h3>
                <p className="text-[10px] font-black uppercase text-[#ffdc00] mt-1 tracking-widest">Admin Bendahara</p>
                
                <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Akses</span>
                    <span className="text-black">Denda & Anggota</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Sesi</span>
                    <span className="text-green-500">Aktif</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full h-14 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all border-2 border-transparent hover:border-red-600"
              >
                <LogOut size={18} /> Keluar Sistem
              </button>
            </div>

            {/* Security Settings */}
            <div className="md:col-span-2">
              <div className="cartoon-card bg-white p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-[#ffdc00]/10 rounded-2xl text-[#ffdc00]">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">Pengaturan Keamanan</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perbarui kredensial login anda</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email Admin</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                      <input 
                        type="text"
                        disabled
                        className="cartoon-input w-full h-12 pl-12! text-sm bg-zinc-50/50 cursor-not-allowed opacity-60"
                        value={user?.email}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Password Baru</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input 
                          type="password"
                          required
                          className="cartoon-input w-full h-12 pl-12! text-sm"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Konfirmasi</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        <input 
                          type="password"
                          required
                          className="cartoon-input w-full h-12 pl-12! text-sm"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={isUpdating}
                      className="cartoon-btn bg-[#ffdc00] text-black h-16 w-full flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-[#ffdc00]/20"
                    >
                      {isUpdating ? 'Memperbarui...' : (
                        <>
                          <Save size={20} /> Simpan Perubahan
                        </>
                      )}
                    </button>
                    
                    <div className="p-4 bg-blue-50 rounded-2xl flex items-start gap-3 border border-blue-100">
                      <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold text-blue-600 uppercase leading-relaxed tracking-wider">
                        Sistem menggunakan enkripsi tingkat tinggi untuk menjaga keamanan password anda di database Supabase.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

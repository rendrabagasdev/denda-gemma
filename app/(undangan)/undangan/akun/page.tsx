'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'
import { Shield, Key, Mail, User, Save, Lock, Info, LogOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function AkunPage() {
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
    router.push('/undangan/login')
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AdminSidebar mode="undangan" />
      
      <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Kelola Akun</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pengaturan keamanan dan profil admin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="cartoon-card bg-white p-6 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100">
                  <User size={40} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 truncate">{user?.email}</h3>
                <p className="text-[10px] font-black uppercase text-indigo-400 mt-1 tracking-widest">Administrator</p>
                
                <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Status</span>
                    <span className="text-green-500">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Level</span>
                    <span>Superadmin</span>
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
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">Keamanan Akun</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganti password secara berkala</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email Terdaftar</label>
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
                      className="cartoon-btn bg-indigo-600 text-white h-16 w-full flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-200"
                    >
                      {isUpdating ? 'Memperbarui...' : (
                        <>
                          <Save size={20} /> Perbarui Password
                        </>
                      )}
                    </button>
                    
                    <div className="p-4 bg-orange-50 rounded-2xl flex items-start gap-3 border border-orange-100">
                      <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-[9px] font-bold text-orange-600 uppercase leading-relaxed tracking-wider">
                        Demi keamanan, gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka. Jangan berikan password kepada siapapun.
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

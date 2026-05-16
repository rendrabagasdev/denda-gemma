'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CartoonButton from '@/components/CartoonButton'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function UndanganLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Selamat datang!')
      router.push('/undangan')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-blue-50/50 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon-card w-full max-w-sm bg-white p-10 relative z-10 border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-5 bg-blue-500/10 rounded-[2.5rem] mb-6 shadow-sm">
            <ShieldCheck size={56} className="text-blue-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Undangan Admin</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">Login Proyek Undangan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-bold mb-3 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
              <input 
                type="email"
                required
                className="cartoon-input w-full pl-16! h-16 text-lg bg-zinc-50 border-zinc-100"
                placeholder="admin@gemma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-3 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
              <input 
                type="password"
                required
                className="cartoon-input w-full pl-16! h-16 text-lg bg-zinc-50 border-zinc-100"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <CartoonButton 
            type="submit" 
            variant="accent" 
            disabled={loading}
            className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-blue-500/20 mt-4"
          >
            {loading ? 'Masuk...' : 'Login Undangan'}
          </CartoonButton>
        </form>

        <p className="mt-8 text-center text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
          Pastikan email terdaftar di Supabase Auth
        </p>
      </motion.div>
    </main>
  )
}

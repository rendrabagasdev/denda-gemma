'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CartoonButton from '@/components/CartoonButton'
import { Lock, User, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock logic for village app
    // You can replace this with Supabase Auth (supabase.auth.signInWithPassword)
    if (password === 'admin123') {
      localStorage.setItem('admin_auth', 'true')
      router.push('/admin')
    } else {
      setError('Password salah! Coba admin123')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-primary/20">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="cartoon-card w-full max-w-sm bg-white p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary border-4 border-black rounded-3xl mb-4 shadow-cartoon">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-2xl font-black uppercase">Admin Login</h1>
          <p className="font-bold opacity-50 text-sm">Khusus Pengurus Organisasi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-black mb-2 uppercase text-xs tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={20} />
              <input 
                type="password"
                className="cartoon-input w-full !pl-16 h-14"
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-secondary font-black text-xs text-center animate-bounce">
              {error}
            </p>
          )}

          <CartoonButton 
            type="submit" 
            variant="primary" 
            className="w-full h-14 text-xl"
          >
            Masuk Sekarang
          </CartoonButton>
        </form>

        <p className="mt-8 text-center text-[10px] font-black opacity-30 uppercase tracking-widest">
          Denda Gemma Security
        </p>
      </motion.div>
    </main>
  )
}

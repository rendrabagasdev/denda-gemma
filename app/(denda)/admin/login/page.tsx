'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CartoonButton from '@/components/CartoonButton'
import { Lock, User, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50/50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon-card w-full max-w-sm bg-white p-10 relative z-10 border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)]"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-5 bg-primary/10 rounded-[2.5rem] mb-6 shadow-sm">
            <ShieldCheck size={56} className="text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">Admin Login</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">Denda Gemma Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-bold mb-3 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Email Address</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
              <input 
                type="email"
                required
                className="cartoon-input w-full pl-16! h-16 text-lg"
                placeholder="admin@gemma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-3 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
              <input 
                type="password"
                required
                className="cartoon-input w-full pl-16! h-16 text-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }}
              className="text-secondary font-bold text-[10px] text-center uppercase tracking-widest bg-red-50 py-3 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <CartoonButton 
            type="submit" 
            variant="primary" 
            className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-primary/20"
          >
            Akses Dashboard
          </CartoonButton>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Denda Gemma Security
          </p>
        </div>
      </motion.div>
    </main>
  )
}

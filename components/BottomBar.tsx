'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Users, Layout, User, Home } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { id: 'print', label: 'Cetak', icon: FileText, path: '/undangan' },
  { id: 'anggota', label: 'Anggota', icon: Users, path: '/undangan/anggota' },
  { id: 'templates', label: 'Template', icon: Layout, path: '/undangan/templates' },
  { id: 'akun', label: 'Akun', icon: User, path: '/undangan/akun' },
]

export default function BottomBar({ mode = 'undangan' }: { mode?: 'undangan' | 'admin' }) {
  const pathname = usePathname()

  // Base path matching logic
  const isActive = (path: string) => {
    if (path === '/undangan' || path === '/admin') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Container with Cartoon Style */}
      <div className="mx-4 mb-6 bg-white border-4 border-zinc-900 rounded-[2.5rem] p-2 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <Link 
              key={item.id} 
              href={item.path}
              className="relative flex-1 flex flex-col items-center justify-center py-3"
            >
              <div className={`relative z-10 transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
                <Icon 
                  size={24} 
                  strokeWidth={active ? 3 : 2}
                  className={active ? 'text-primary' : 'text-zinc-400'} 
                />
              </div>
              
              <span className={`text-[8px] font-black uppercase mt-1 tracking-widest transition-colors ${active ? 'text-zinc-900' : 'text-zinc-400'}`}>
                {item.label}
              </span>

              {/* Active Indicator Blob */}
              {active && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-2 inset-y-1 bg-zinc-50 rounded-3xl -z-0"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import { Home, History, LogOut, Download, FileSpreadsheet, ArrowLeft, FileText, Users, Layout, PlusSquare } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import sidebarData from '@/data/sidebarDenda.json'
import undanganSidebarData from '@/data/undangan_sidebar.json'

interface AdminSidebarProps {
  onAction?: (action: any) => void
  activeAction?: string | null
  mode?: 'denda' | 'undangan'
}

// Icon mapping to convert string names to components
const IconMap: Record<string, any> = {
  Home: Home,
  History: History,
  FileText: FileText,
  Download: Download,
  FileSpreadsheet: FileSpreadsheet,
  Users: Users,
  Layout: Layout,
  PlusSquare: PlusSquare
}

export default function AdminSidebar({ onAction, activeAction, mode = 'denda' }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const currentData = mode === 'undangan' ? undanganSidebarData : sidebarData

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(mode === 'undangan' ? '/undangan/login' : '/admin/login')
  }

  const menuItems = currentData.menuItems.map(item => ({
    ...item,
    icon: IconMap[item.icon] ? <span className="shrink-0">{(() => {
      const Icon = IconMap[item.icon]
      return <Icon size={20} />
    })()}</span> : null,
    isActive: pathname === item.path && !activeAction
  }))

  const actionItems = currentData.actionItems.map(item => ({
    ...item,
    icon: IconMap[item.icon] ? <span className="shrink-0">{(() => {
      const Icon = IconMap[item.icon]
      return <Icon size={20} />
    })()}</span> : null,
    isActive: activeAction === item.id
  }))

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-zinc-100 p-8 shrink-0">
      <header className="mb-6">
        <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.8] text-zinc-900">
          GEMMA<br/>
          <span className="text-[#1787ff] drop-shadow-sm">ADMIN</span>
        </h1>
      </header>

      <nav className="flex-1 space-y-1.5">
        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest ml-4 mb-2">Menu Utama</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${
              item.isActive 
                ? 'bg-[#1787ff] text-white shadow-lg shadow-[#1787ff]/20' 
                : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className={`${item.isActive ? '' : 'group-hover:-translate-y-0.5 transition-transform'}`}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="my-6 border-t border-zinc-50" />
        
        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest ml-4 mb-2">Alat Bantu</p>
        {actionItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction?.(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${
              item.isActive 
                ? 'bg-[#1787ff] text-black shadow-lg shadow-[#1787ff]/20' 
                : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className={`${item.isActive ? '' : 'group-hover:-translate-y-0.5 transition-transform'}`}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 p-4 text-zinc-400 hover:text-black font-bold transition-colors group"
      >
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        <span>Logout</span>
      </button>
    </aside>
  )
}

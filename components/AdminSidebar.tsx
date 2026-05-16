'use client'

import { Home, History, LogOut, Download, FileSpreadsheet, ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminSidebarProps {
  onAction?: (action: any) => void
  activeAction?: string | null
}

export default function AdminSidebar({ onAction, activeAction }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    router.push('/admin/login')
  }

  const menuItems = [
    { 
      id: 'dashboard',
      label: 'Dashboard', 
      icon: <Home size={20} />, 
      path: '/admin',
      isActive: pathname === '/admin' && !activeAction
    },
    { 
      id: 'history',
      label: 'Riwayat', 
      icon: <History size={20} />, 
      path: '/admin/history',
      isActive: pathname === '/admin/history'
    }
  ]

  const actionItems = [
    { 
      id: 'import',
      label: 'Import Data', 
      icon: <Download size={20} />, 
      isActive: activeAction === 'import'
    },
    { 
      id: 'export',
      label: 'Export Excel', 
      icon: <FileSpreadsheet size={20} />, 
      isActive: activeAction === 'export'
    }
  ]

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-zinc-100 p-8 shrink-0">
      <header className="mb-6">
        <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.8] text-zinc-900">
          GEMMA<br/>
          <span className="text-[#ffdc00] drop-shadow-sm">ADMIN</span>
        </h1>
        <p className="text-[10px] font-black text-zinc-300 mt-4 uppercase tracking-[0.3em]">Manajemen Denda</p>
      </header>

      <nav className="flex-1 space-y-1.5">
        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest ml-4 mb-2">Menu Utama</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${
              item.isActive 
                ? 'bg-[#ffdc00] text-black shadow-lg shadow-[#ffdc00]/20' 
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
                ? 'bg-[#ffdc00] text-black shadow-lg shadow-[#ffdc00]/20' 
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

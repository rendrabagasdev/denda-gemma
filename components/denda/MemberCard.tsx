import { Member, Fine } from '@/lib/supabase'
import { Banknote, Clock, Users, ChevronRight, CheckCircle2 } from 'lucide-react'

interface MemberCardProps {
  member: Member
  fines: Fine[]
  onClick?: () => void
  children?: React.ReactNode
}

export default function MemberCard({ member, fines, onClick, children }: MemberCardProps) {
  const unpaidFines = fines.filter(f => !f.is_paid)
  const totalDenda = unpaidFines.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div 
      onClick={onClick}
      className="cartoon-card p-7 cursor-pointer active:scale-[0.98] transition-all bg-white border border-zinc-100/80 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">{member.nama}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded uppercase">RT {member.rt}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">Tunggakan</p>
          <p className={`text-2xl font-black leading-none ${totalDenda === 0 ? 'text-blue-500' : 'text-red-500'}`}>
            Rp {totalDenda.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-0">
        <div className="flex gap-1.5 flex-wrap">
          {unpaidFines.length > 0 ? (
            [...new Set(unpaidFines.map(f => f.type))].map(type => (
              <span key={type} className="px-2.5 py-0.5 bg-zinc-50 text-zinc-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-zinc-100">
                {type}
              </span>
            ))
          ) : (
            <span className="text-xs font-bold text-success uppercase italic opacity-40">Jossss, semua sudah lunas!</span>
          )}
        </div>
        {unpaidFines.length > 0 && (
          <div className="flex items-center gap-1 text-[9px] font-black bg-zinc-50 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-100">
            <Clock size={10} /> {unpaidFines.length} Item
          </div>
        )}
      </div>

      {children && (
        <div className="mt-1 pt-3 border-t border-zinc-100/50">
          {children}
        </div>
      )}
    </div>
  )
}

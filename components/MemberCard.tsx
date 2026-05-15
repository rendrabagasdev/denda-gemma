import { Member, Fine } from '@/lib/supabase'
import { Banknote, Clock, Users, ChevronRight, CheckCircle2 } from 'lucide-react'

interface MemberCardProps {
  member: Member
  fines: Fine[]
  onClick?: () => void
}

export default function MemberCard({ member, fines, onClick }: MemberCardProps) {
  const unpaidFines = fines.filter(f => !f.is_paid)
  const totalDenda = unpaidFines.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div 
      onClick={onClick}
      className="cartoon-card p-6 cursor-pointer active:scale-95 transition-all bg-white border border-zinc-100/50"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-zinc-900">{member.nama}</h3>
          <p className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mt-1 uppercase tracking-wider">
            <Users size={14} className="text-primary" /> RT {member.rt}
          </p>
        </div>
        <div className="bg-zinc-50 rounded-2xl p-3 text-zinc-300">
          <ChevronRight size={20} />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {unpaidFines.length > 0 ? (
          [...new Set(unpaidFines.map(f => f.type))].map(type => (
            <span key={type} className="cartoon-badge bg-secondary/10 text-secondary border-none">
              {type}
            </span>
          ))
        ) : (
          <span className="cartoon-badge bg-success/10 text-success flex items-center gap-1.5 border-none">
            Lunas <CheckCircle2 size={12} />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-5 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-xl">
            <Banknote className="text-success" size={20} />
          </div>
          <span className="font-black text-xl text-zinc-900">
            Rp {totalDenda.toLocaleString('id-ID')}
          </span>
        </div>
        {unpaidFines.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold bg-primary/10 text-primary-dark px-3 py-1.5 rounded-full">
            <Clock size={12} /> {unpaidFines.length} Item
          </div>
        )}
      </div>
    </div>
  )
}

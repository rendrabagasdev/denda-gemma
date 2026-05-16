'use client'

import * as XLSX from 'xlsx'
import CartoonButton from '@/components/CartoonButton'
import { FileSpreadsheet } from 'lucide-react'
import { Member, Fine } from '@/lib/supabase'

interface ExportDataProps {
  data: Member[]
  fines: Fine[]
}

export default function ExportData({ data, fines }: ExportDataProps) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(m => {
      const totalDenda = fines
        .filter(f => f.member_id === m.id && !f.is_paid)
        .reduce((sum, f) => sum + f.amount, 0)
        
      return { 
        Nama: m.nama, 
        RT: m.rt,
        'Total Denda': totalDenda
      }
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Anggota")
    XLSX.writeFile(wb, `daftar_denda_gemma_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <CartoonButton 
      onClick={exportToExcel}
      variant="success"
      className="w-full py-3 flex items-center justify-center gap-2"
    >
      <FileSpreadsheet size={20} /> Download Excel (.xlsx)
    </CartoonButton>
  )
}

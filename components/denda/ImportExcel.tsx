import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import CartoonButton from '../CartoonButton'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileCode } from 'lucide-react'

export default function ImportData({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const processData = async (data: any[]) => {
    console.log('Raw data received for processing:', data)

    // Helper untuk mengambil nilai dari key tanpa peduli besar/kecil huruf
    const getValue = (obj: any, key: string) => {
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())
      return foundKey ? obj[foundKey] : undefined
    }

    // 1. Menyiapkan payload dengan normalisasi key (Case-Insensitive)
    const payload = data
      .map(row => {
        const nama = getValue(row, 'nama') || getValue(row, 'NAMA') || getValue(row, 'Nama')
        const rt = getValue(row, 'rt') || getValue(row, 'RT') || getValue(row, 'Rt')
        const denda = getValue(row, 'denda') || getValue(row, 'DENDA') || getValue(row, 'Denda')

        return {
          nama: nama ? String(nama).trim() : '',
          rt: rt ? String(rt).trim() : '',
          denda: denda ? Number(denda) : 0
        }
      })
      .filter(row => row.nama !== '') // Hanya yang ada namanya

    console.log('Payload processed for RPC:', payload)

    if (payload.length === 0) {
      throw new Error('Tidak ada data valid yang ditemukan (Pastikan ada kolom NAMA/nama)')
    }

    // 2. Kirim ke RPC Supabase
    const { error } = await supabase.rpc('import_data_transaction', {
      payload: payload
    })

    if (error) {
      console.error('Database Error:', error)
      throw new Error(`Database Error: ${error.message}`)
    }
    
    return payload.length
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setStatus(null)

    const reader = new FileReader()
    const fileName = file.name.toLowerCase()

    reader.onload = async (evt) => {
      try {
        let data: any[] = []

        if (fileName.endsWith('.json')) {
          const content = evt.target?.result as string
          data = JSON.parse(content)
          if (!Array.isArray(data)) data = [data]
        } else {
          const bstr = evt.target?.result
          const wb = XLSX.read(bstr, { type: 'binary' })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          data = XLSX.utils.sheet_to_json(ws) as any[]
        }

        const count = await processData(data)
        setStatus({ type: 'success', message: `Berhasil mengimpor ${count} anggota!` })
        onComplete()
      } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Gagal memproses file' })
      } finally {
        setLoading(false)
      }
    }

    if (fileName.endsWith('.json')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }

  return (
    <div className="cartoon-card p-6 bg-yellow-50 border-dashed border-4">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex gap-2">
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-cartoon">
            <FileSpreadsheet size={40} className="text-success" />
          </div>
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-cartoon">
            <FileCode size={40} className="text-accent" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-black">Import Excel / JSON</h3>
          <p className="text-sm font-bold opacity-60 italic">Kolom wajib: nama, rt (denda opsional)</p>
        </div>

        <label className="w-full">
          <input 
            type="file" 
            accept=".xlsx, .xls, .json" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={loading}
          />
          <div className={`cartoon-btn w-full flex items-center justify-center gap-2 cursor-pointer ${loading ? 'opacity-50' : 'bg-white hover:bg-zinc-100'}`}>
            {loading ? 'Sabar ya...' : (
              <>
                <Upload size={20} /> Pilih File (Excel/JSON)
              </>
            )}
          </div>
        </label>

        {status && (
          <div className={`flex items-center gap-2 font-bold ${status.type === 'success' ? 'text-success' : 'text-secondary'}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}

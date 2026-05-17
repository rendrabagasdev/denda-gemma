'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Member } from '@/lib/supabase'
import { getDashboardData } from '@/app/actions/denda'
import { getTemplates, Template } from '@/app/actions/templates'
import AdminSidebar from '@/components/AdminSidebar'
import BottomBar from '@/components/BottomBar'
import { Search, Download, FileText, CheckCircle2, ChevronLeft, Printer, Mail, Calendar, Info, X, Layout, Users, Edit2, ArrowLeft, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'react-hot-toast'
import { saveAs } from 'file-saver'
import mammoth from 'mammoth'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { convertDocxToPdf } from '@/app/actions/undangan'

export default function UndanganPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  
  // Filter States
  const [filterRT, setFilterRT] = useState<string>('all')
  const [filterDivisi, setFilterDivisi] = useState<string>('all')
  const [filterJabatan, setFilterJabatan] = useState<string>('all')
  
  // Print Modal States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [eventHari, setEventHari] = useState('')
  const [eventTanggal, setEventTanggal] = useState('')
  const [eventJam, setEventJam] = useState('')
  const [eventTempat, setEventTempat] = useState('')
  const [eventName, setEventName] = useState('')
  const invitationRef = useRef<HTMLDivElement>(null)
  
  const [today, setToday] = useState('')
  const [isMounted, setIsMounted] = useState(false)
 
  useEffect(() => {
    setToday(new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }))
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/undangan/login')
      } else {
        fetchData()
      }
    }
    
    checkUser()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { members: mData } = await getDashboardData()
    const tData = await getTemplates()
    if (mData) {
      setMembers(mData.sort((a, b) => a.nama.localeCompare(b.nama)))
    }
    setTemplates(tData)
    if (tData.length > 0) setSelectedTemplate(tData[0])
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredMembers.map(m => m.id))
    }
  }

  const handleExportPDFWithAPI = async () => {
    if (!selectedTemplate) {
      toast.error('Pilih template terlebih dahulu!')
      return
    }

    setIsExporting(true)
    setIsPrintModalOpen(false)
    const toastId = toast.loading('Mengonversi ke PDF (Cloud API)...', { id: 'pdf-export-api' })

    try {
      const selectedMembers = members.filter(m => selectedIds.includes(m.id))
      let baseContent = selectedTemplate.content

      if (!baseContent.startsWith('file:')) {
        throw new Error('Hanya template Word (.docx) yang bisa diekspor ke PDF via API.')
      }

      const fileUrl = baseContent.replace('file:', '')
      const response = await fetch(fileUrl)
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      const pagesData = []
      for (let j = 0; j < selectedMembers.length; j += 4) {
        const chunk = selectedMembers.slice(j, j + 4)
        pagesData.push({
          m1_nama: chunk[0]?.nama || '', m1_rt: chunk[0]?.rt || '',
          m2_nama: chunk[1]?.nama || '', m2_rt: chunk[1]?.rt || '',
          m3_nama: chunk[2]?.nama || '', m3_rt: chunk[2]?.rt || '',
          m4_nama: chunk[3]?.nama || '', m4_rt: chunk[3]?.rt || '',
          hari: eventHari || 'Minggu',
          tanggal: eventTanggal || today,
          jam: eventJam || '19.30 WIB',
          tempat: eventTempat || 'Rumah Ketua GEMMA',
          acara: eventName || 'Pertemuan Rutin'
        })
      }

      doc.render({ pages: pagesData })
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      try {
        // 1. Ubah Blob ke Base64 untuk dikirim ke Server Action
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1]
            resolve(base64String)
          }
        })
        reader.readAsDataURL(out)
        const base64Docx = await base64Promise
        if (!base64Docx) {
          throw new Error('Gagal memproses file Word ke format Base64.')
        }

        // 2. Panggil Server Action
        const result = await convertDocxToPdf(base64Docx)

        if (!result.success || !result.pdfUrl) {
          throw new Error(result.error || 'Gagal konversi')
        }

        // 3. Download hasil PDF
        const pdfFile = await fetch(result.pdfUrl)
        const pdfBlob = await pdfFile.blob()
        saveAs(pdfBlob, `Undangan_GEMMA_${new Date().getTime()}.pdf`)
        
        toast.success('PDF berhasil dibuat!', { id: toastId })
      } catch (apiError) {
        console.warn('PDF Conversion failed, falling back to Word:', apiError)
        saveAs(out, `Undangan_GEMMA_${new Date().getTime()}.docx`)
        toast.success('Gagal PDF. Mengunduh format Word sebagai cadangan.', { id: toastId, duration: 5000 })
      }
    } catch (error) {
      console.error('Export Error:', error)
      toast.error('Gagal memproses dokumen.', { id: 'pdf-export-api' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDocx = async () => {
    if (!selectedTemplate) {
      toast.error('Pilih template terlebih dahulu!')
      return
    }

    setIsExporting(true)
    setIsPrintModalOpen(false)
    toast.loading('Menyiapkan dokumen (Layout 4-in-1)...', { id: 'pdf-export' })

    try {
      const selectedMembers = members.filter(m => selectedIds.includes(m.id))
      let baseContent = selectedTemplate.content

      // JIKA FILE WORD (.docx), GUNAKAN SISTEM BINER AGAR STYLE TIDAK HANCUR
      if (baseContent.startsWith('file:')) {
        const fileUrl = baseContent.replace('file:', '')
        const response = await fetch(fileUrl)
        const arrayBuffer = await response.arrayBuffer()
        
        const zip = new PizZip(arrayBuffer)
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        })

        // Kita siapkan data untuk 4 orang per halaman
        // Kita loop per 4 orang dan buat satu file per halaman untuk keamanan style
        // Namun jika kamu ingin semua dalam satu file, kita gunakan logic pagesData
        
        const pagesData = []
        for (let j = 0; j < selectedMembers.length; j += 4) {
          const chunk = selectedMembers.slice(j, j + 4)
          pagesData.push({
            m1_nama: chunk[0]?.nama || '', m1_rt: chunk[0]?.rt || '',
            m2_nama: chunk[1]?.nama || '', m2_rt: chunk[1]?.rt || '',
            m3_nama: chunk[2]?.nama || '', m3_rt: chunk[2]?.rt || '',
            m4_nama: chunk[3]?.nama || '', m4_rt: chunk[3]?.rt || '',
            hari: eventHari || 'Minggu',
            tanggal: eventTanggal || today,
            jam: eventJam || '19.30 WIB',
            tempat: eventTempat || 'Rumah Ketua GEMMA',
            acara: eventName || 'Pertemuan Rutin'
          })
        }
        
        // Cek apakah user menggunakan {#pages}
        try {
          doc.render({
            pages: pagesData,
            // Fallback jika user tidak pakai {#pages} tapi cuma mau cetak 4 orang pertama
            m1_nama: selectedMembers[0]?.nama || '', m1_rt: selectedMembers[0]?.rt || '',
            m2_nama: selectedMembers[1]?.nama || '', m2_rt: selectedMembers[1]?.rt || '',
            m3_nama: selectedMembers[2]?.nama || '', m3_rt: selectedMembers[2]?.rt || '',
            m4_nama: selectedMembers[3]?.nama || '', m4_rt: selectedMembers[3]?.rt || '',
            hari: eventHari || 'Minggu',
            tanggal: eventTanggal || today,
            jam: eventJam || '19.30 WIB',
            tempat: eventTempat || 'Rumah Ketua GEMMA',
            acara: eventName || 'Pertemuan Rutin'
          })
        } catch (e: any) {
          console.error('Render Error:', e)
          toast.error('Gagal mengisi data ke Word. Cek kembali tag di file Word-mu.', { id: 'pdf-export' })
          setIsExporting(false)
          return
        }

        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })

        const url = window.URL.createObjectURL(out)
        const a = document.createElement('a')
        a.href = url
        a.download = `Undangan_Gemma_${Date.now()}.docx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast.success('Berhasil! File Word siap dicetak dengan desain asli.', { id: 'pdf-export' })
        setIsExporting(false)
        return
      }

      // JIKA TEMPLATE HTML (Gunakan PDF seperti biasa)
      const pdf = new jsPDF('p', 'mm', 'a4')

      // Group members by 4 for 4-in-1 layout
      for (let i = 0; i < selectedMembers.length; i += 4) {
        if (i > 0) pdf.addPage()
        
        const chunk = selectedMembers.slice(i, i + 4)
        const container = document.createElement('div')
        container.className = "pdf-page-container"
        container.style.width = '210mm'
        container.style.height = '297mm'
        container.style.padding = '5mm'
        container.style.background = 'white'
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.display = 'grid'
        container.style.gridTemplateColumns = '1fr 1fr'
        container.style.gridTemplateRows = '1fr 1fr'
        container.style.gap = '5mm'

        // CSS to fix mammoth output styling - LEBIH KUAT & RAPI
        const style = document.createElement('style')
        style.innerHTML = `
          .invitation-box {
            border: 1px solid #ddd;
            padding: 15mm 10mm;
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.5;
            color: black;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: white;
          }
          .invitation-box table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
          }
          .invitation-box td { 
            vertical-align: top; 
            padding: 2px 0;
          }
          /* Memastikan kolom label punya lebar tetap agar titik dua sejajar */
          .invitation-box td:first-child { width: 80px; }
          .invitation-box td:nth-child(2) { width: 15px; text-align: center; }
          
          .invitation-box p { margin: 0 0 8px 0; text-align: justify; }
          .invitation-box img { 
            display: block;
            margin: 0 auto 10px auto;
            max-width: 100px; 
            height: auto; 
          }
          .invitation-box h1, .invitation-box h2, .invitation-box h3 { 
            text-align: center; 
            margin: 2px 0; 
            text-transform: uppercase;
            font-size: 14pt;
          }
          .invitation-box .header-text {
            text-align: center;
            font-size: 9pt;
            border-bottom: 2px solid black;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
        `
        container.appendChild(style)

        chunk.forEach(member => {
          const box = document.createElement('div')
          box.className = "invitation-box"
          
          let processed = baseContent
            .replace(/{{nama}}/gi, member.nama)
            .replace(/{{rt}}/gi, member.rt)
            .replace(/{{hari}}/gi, eventHari || 'Minggu')
            .replace(/{{tanggal}}/gi, eventTanggal || today)
            .replace(/{{jam}}/gi, eventJam || '19.30 WIB')
            .replace(/{{tempat}}/gi, eventTempat || 'Rumah Ketua GEMMA')
            .replace(/{{acara}}/gi, eventName || 'Pertemuan Rutin')

          box.innerHTML = processed
          container.appendChild(box)
        })

        document.body.appendChild(container)

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false
        })
        
        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        document.body.removeChild(container)
      }

      pdf.save(`Undangan_Gemma_${Date.now()}.pdf`)
      toast.success('PDF Berhasil dibuat!', { id: 'pdf-export' })
    } catch (error) {
      console.error('PDF Error:', error)
      toast.error('Gagal membuat PDF', { id: 'pdf-export' })
    } finally {
      setIsExporting(false)
    }
  }

  // Get Unique Values for Filters
  const uniqueRTs = useMemo(() => Array.from(new Set(members.map(m => m.rt))).sort(), [members])
  const uniqueDivisis = useMemo(() => Array.from(new Set(members.map(m => m.divisi || '-'))).sort(), [members])
  const uniqueJabatans = useMemo(() => Array.from(new Set(members.map(m => m.jabatan || 'Anggota'))).sort(), [members])

  // Filter & Sort Anggota: RT -> Nama
  const filteredMembers = useMemo(() => {
    return members
      .filter(m => {
        const matchesSearch = m.nama.toLowerCase().includes(search.toLowerCase()) || 
                             m.rt.toLowerCase().includes(search.toLowerCase())
        const matchesRT = filterRT === 'all' || m.rt === filterRT
        const matchesDivisi = filterDivisi === 'all' || (m.divisi || '-') === filterDivisi
        const matchesJabatan = filterJabatan === 'all' || (m.jabatan || 'Anggota') === filterJabatan
        
        return matchesSearch && matchesRT && matchesDivisi && matchesJabatan
      })
      .sort((a, b) => {
        const rtA = parseInt(a.rt) || 0
        const rtB = parseInt(b.rt) || 0
        if (rtA !== rtB) return rtA - rtB
        return a.nama.localeCompare(b.nama)
      })
  }, [members, search, filterRT, filterDivisi, filterJabatan])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      <AdminSidebar mode="undangan" />
      
      <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto h-screen pb-32 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">GEMMA Tobratan</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem Undangan Digital Dusun Tobratan • {today}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={selectAll}
                className="px-6 h-14 rounded-2xl border-2 border-black font-black text-[10px] uppercase tracking-widest bg-white hover:bg-zinc-50 transition-all"
              >
                {selectedIds.length === filteredMembers.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>

              <button 
                onClick={() => setIsPrintModalOpen(true)}
                disabled={isExporting || selectedIds.length === 0}
                className={`px-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                  selectedIds.length > 0 
                  ? 'bg-primary text-black shadow-primary/20' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <Printer size={18} />
                {isExporting ? 'Proses...' : `Cetak (${selectedIds.length})`}
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                <input 
                  type="text"
                  placeholder="Cari nama atau RT..."
                  className="cartoon-input w-full pl-16! h-14 text-sm bg-white shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Custom RT Filter */}
              <div className="relative group">
                <select 
                  value={filterRT}
                  onChange={(e) => setFilterRT(e.target.value)}
                  className="cartoon-input h-14 px-6 w-full text-[10px] font-black uppercase tracking-widest bg-white cursor-pointer appearance-none outline-none"
                >
                  <option value="all">Semua RT</option>
                  {uniqueRTs.map(rt => <option key={rt} value={rt}>RT {rt}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-black transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>

              <div className="bg-white px-6 h-14 rounded-2xl border-2 border-zinc-100 flex items-center gap-3">
                <Users className="text-zinc-400" size={18} />
                <span className="font-black text-[10px] uppercase tracking-widest text-zinc-600">{filteredMembers.length} Hasil</span>
              </div>
            </div>

            {/* Advanced Filters with Custom Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative group">
                <select 
                  value={filterDivisi}
                  onChange={(e) => setFilterDivisi(e.target.value)}
                  className="cartoon-input h-12 px-6 w-full text-[9px] font-black uppercase tracking-widest bg-white cursor-pointer appearance-none outline-none"
                >
                  <option value="all">Semua Divisi</option>
                  {uniqueDivisis.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="relative group">
                <select 
                  value={filterJabatan}
                  onChange={(e) => setFilterJabatan(e.target.value)}
                  className="cartoon-input h-12 px-6 w-full text-[9px] font-black uppercase tracking-widest bg-white cursor-pointer appearance-none outline-none"
                >
                  <option value="all">Semua Jabatan</option>
                  {uniqueJabatans.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Members Content */}
          <div className="cartoon-card bg-white p-0 overflow-hidden mb-20">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                 <p className="font-bold text-zinc-400 uppercase text-[10px] tracking-[0.2em]">Memuat Data...</p>
               </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50/50 border-b-2 border-zinc-100">
                      <tr>
                        <th className="p-6 w-16">
                          <div 
                            onClick={selectAll}
                            className={`w-6 h-6 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${
                              selectedIds.length === filteredMembers.length && filteredMembers.length > 0
                              ? 'bg-primary border-black' 
                              : 'bg-white border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            {selectedIds.length === filteredMembers.length && filteredMembers.length > 0 && (
                              <CheckCircle2 size={14} className="text-white" />
                            )}
                          </div>
                        </th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Nama Lengkap</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-center">RT</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Sie / Divisi</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400">Jabatan</th>
                        <th className="p-6 font-black uppercase text-[10px] tracking-widest text-zinc-400 text-right w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filteredMembers.map((member) => (
                        <tr 
                          key={member.id}
                          onClick={() => toggleSelect(member.id)}
                          className={`group cursor-pointer transition-colors hover:bg-zinc-50/50 ${
                            selectedIds.includes(member.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="p-6">
                            <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                              selectedIds.includes(member.id) 
                              ? 'bg-primary border-black' 
                              : 'bg-white border-zinc-200 group-hover:border-zinc-400'
                            }`}>
                              {selectedIds.includes(member.id) && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-xs text-zinc-400">
                                {member.nama.charAt(0)}
                              </div>
                              <span className="font-bold text-zinc-900">{member.nama}</span>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <span className="px-3 py-1 bg-zinc-100 rounded-full font-black text-[10px] text-zinc-500">RT {member.rt}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{member.divisi || '-'}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{member.jabatan || 'Anggota'}</span>
                          </td>
                          <td className="p-6 text-right">
                            <button className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-zinc-50">
                  {/* Mobile Select All Bar */}
                  {filteredMembers.length > 0 && (
                    <div 
                      onClick={selectAll}
                      className="p-4 bg-zinc-50/50 flex items-center gap-4 cursor-pointer"
                    >
                      <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                        selectedIds.length === filteredMembers.length 
                        ? 'bg-primary border-black' 
                        : 'bg-white border-zinc-300'
                      }`}>
                        {selectedIds.length === filteredMembers.length && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest text-zinc-600">
                        {selectedIds.length === filteredMembers.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                      </span>
                    </div>
                  )}

                  {filteredMembers.map((member) => (
                    <div 
                      key={member.id}
                      onClick={() => toggleSelect(member.id)}
                      className={`p-4 flex items-center gap-4 active:bg-zinc-100 transition-colors ${
                        selectedIds.includes(member.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border-2 shrink-0 transition-all flex items-center justify-center ${
                        selectedIds.includes(member.id) 
                        ? 'bg-primary border-black' 
                        : 'bg-white border-zinc-200'
                      }`}>
                        {selectedIds.includes(member.id) && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">{member.nama}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase text-zinc-400">RT {member.rt}</span>
                          <span className="text-[9px] font-bold text-zinc-400">•</span>
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 rounded-full">{member.jabatan || 'Anggota'}</span>
                          <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[100px]">{member.divisi || '-'}</span>
                        </div>
                      </div>
                      <button className="p-2 text-zinc-300">
                        <Edit2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {filteredMembers.length === 0 && (
                  <div className="py-20 text-center">
                    <Search className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <p className="font-black uppercase text-xs tracking-widest text-zinc-400">Data Tidak Ditemukan</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Cetak - Tetap di sini */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/60">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="cartoon-card bg-white w-full max-w-lg p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="absolute right-6 top-6 p-2 bg-zinc-50 text-zinc-400 rounded-xl hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Printer size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Persiapan Cetak</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Atur detail undangan</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar p-1">
                {/* Template Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Pilih Template</label>
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          selectedTemplate?.id === t.id 
                          ? 'bg-primary/5 border-primary ring-4 ring-primary/10' 
                          : 'bg-white border-zinc-100 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={t.content.startsWith('file:') ? 'text-blue-500' : 'text-primary'}>
                            {t.content.startsWith('file:') ? <FileText size={20} /> : <Layout size={20} />}
                          </div>
                          <span className="font-bold text-sm">{t.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Hari Input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Hari</label>
                    <input 
                      type="text"
                      placeholder="Minggu"
                      className="cartoon-input w-full h-12 text-sm bg-zinc-50/50"
                      value={eventHari}
                      onChange={(e) => setEventHari(e.target.value)}
                    />
                  </div>
                  {/* Jam Input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Jam</label>
                    <input 
                      type="text"
                      placeholder="19.30 WIB"
                      className="cartoon-input w-full h-12 text-sm"
                      value={eventJam}
                      onChange={(e) => setEventJam(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tanggal Input with Sync */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Pilih Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="date"
                      className="cartoon-input w-full h-12 pl-12! text-sm cursor-pointer"
                      onChange={(e) => {
                        const date = new Date(e.target.value)
                        if (!isNaN(date.getTime())) {
                          // Set Hari
                          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                          setEventHari(days[date.getDay()])
                          
                          // Set Tanggal Format Indonesia
                          const formatted = date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                          setEventTanggal(formatted)
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Tanggal Result (Editable) */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Format Tanggal (Hasil)</label>
                  <input 
                    type="text"
                    placeholder="17 Mei 2026"
                    className="cartoon-input w-full h-12 text-sm bg-zinc-50/50"
                    value={eventTanggal}
                    onChange={(e) => setEventTanggal(e.target.value)}
                  />
                </div>

                {/* Tempat Input */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Tempat</label>
                  <input 
                    type="text"
                    placeholder="Rumah Sdr. Ketua GEMMA"
                    className="cartoon-input w-full h-12 text-sm"
                    value={eventTempat}
                    onChange={(e) => setEventTempat(e.target.value)}
                  />
                </div>

                {/* Event Input */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nama Acara</label>
                  <input 
                    type="text"
                    placeholder="Pertemuan Rutin & Arisan"
                    className="cartoon-input w-full h-12 text-sm"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleExportDocx}
                    className="cartoon-btn bg-zinc-100 h-16 w-full flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-zinc-200"
                  >
                    <Download size={20} /> Word
                  </button>
                  <button 
                    onClick={handleExportPDFWithAPI}
                    className="cartoon-btn bg-primary h-16 w-full flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20"
                  >
                    <FileText size={20} /> PDF
                  </button>
                </div>
                <p className="text-[9px] font-bold text-zinc-400 text-center uppercase tracking-widest">
                  Mencetak untuk {selectedIds.length} penerima
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <BottomBar />
    </div>
  )
}

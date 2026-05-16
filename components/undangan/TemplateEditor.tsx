'use client'

import { useState } from 'react'
import CartoonButton from '@/components/CartoonButton'
import { Save, Eye, X, Type, Image as ImageIcon, Layout, FileText, Upload } from 'lucide-react'
import { uploadTemplateFile } from '@/app/actions/templates'

interface Template {
  id: string
  name: string
  content: string
  category: string
}

export default function TemplateEditor({ 
  template, 
  onSave, 
  onClose 
}: { 
  template: Template, 
  onSave: (t: Template) => void, 
  onClose: () => void 
}) {
  const [editedTemplate, setEditedTemplate] = useState(template)
  const [useWord, setUseWord] = useState(template.content.startsWith('file:'))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.docx')) {
        alert('Hanya file .docx yang diizinkan!')
        return
      }
      
      const { publicUrl, error } = await uploadTemplateFile(file)
      if (error) {
        alert('Gagal upload: ' + error.message)
        return
      }

      setEditedTemplate({
        ...editedTemplate,
        name: editedTemplate.name || file.name.replace('.docx', ''),
        content: `file:${publicUrl}` 
      })
      setUseWord(true)
    }
  }

  return (
    <div className="flex flex-col p-4 lg:p-0">
      <div className="flex justify-between items-center mb-6 lg:mb-8 shrink-0">
        <div className="flex gap-2">
          <button 
            onClick={() => setUseWord(false)}
            className={`px-4 lg:px-6 h-10 lg:h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!useWord ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white border-2 border-zinc-100 text-zinc-400'}`}
          >
            Editor Teks
          </button>
          <button 
            onClick={() => setUseWord(true)}
            className={`px-4 lg:px-6 h-10 lg:h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${useWord ? 'bg-[#ffdc00] text-black shadow-lg shadow-[#ffdc00]/20' : 'bg-white border-2 border-zinc-100 text-zinc-400'}`}
          >
            Upload Word (.docx)
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-zinc-400"
        >
          <X size={24} />
        </button>
      </div>

      <div className={`grid gap-6 lg:gap-8 ${useWord ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Editor Side */}
        <div className="flex flex-col gap-4 overflow-y-auto lg:overflow-hidden no-scrollbar pr-1">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nama Template</label>
              <input 
                type="text"
                value={editedTemplate.name}
                onChange={(e) => setEditedTemplate({...editedTemplate, name: e.target.value})}
                className="cartoon-input w-full text-sm lg:text-base"
                placeholder="Contoh: Undangan Rutinan"
              />
            </div>
            
            {!useWord ? (
              <div className="flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Konten (HTML/Text)</label>
                <textarea 
                  value={editedTemplate.content.startsWith('file:') ? '' : editedTemplate.content}
                  onChange={(e) => setEditedTemplate({...editedTemplate, content: e.target.value})}
                  className="cartoon-input w-full min-h-[250px] lg:min-h-[350px] font-mono text-xs lg:text-sm p-4 lg:p-6 resize-none"
                  placeholder="Masukkan konten undangan di sini..."
                />
                <p className="mt-2 text-[9px] font-bold text-zinc-400">Gunakan {"{{nama}}"}, {"{{rt}}"}, {"{{tanggal}}"} sebagai placeholder.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Berkas Template (.docx)</label>
                <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-blue-100 rounded-[2.5rem] p-8 lg:p-20 text-center bg-blue-50/30 min-h-[400px]">
                  <div className="w-20 h-20 lg:w-28 lg:h-28 bg-blue-500 text-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
                    <Upload size={48} strokeWidth={3} />
                  </div>
                  
                  {editedTemplate.content.startsWith('file:') ? (
                    <div className="mb-8">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">File Terpilih:</p>
                      <p className="text-lg lg:text-xl font-black text-zinc-900 truncate max-w-[300px] lg:max-w-md">{editedTemplate.content.replace('file:', '').split('/').pop()}</p>
                    </div>
                  ) : (
                    <div className="mb-10">
                      <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight mb-2 text-zinc-900">Siapkan File Word</h3>
                      <p className="text-xs font-bold text-zinc-400 max-w-[250px] mx-auto uppercase tracking-widest leading-relaxed">Unggah file .docx dengan tag {"{{nama}}"} di dalamnya</p>
                    </div>
                  )}
                  
                  <label className="cartoon-btn bg-white px-12 h-16 lg:h-20 flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-all active:scale-95 shadow-xl border-4 border-black">
                    <span className="font-black uppercase text-xs lg:text-sm tracking-widest">Pilih File Word (.docx)</span>
                    <input type="file" accept=".docx" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Side (Only shown in Text Editor mode) */}
        {!useWord && (
          <div className="bg-zinc-100 rounded-[2rem] lg:rounded-[2.5rem] p-4 lg:p-8 overflow-y-auto no-scrollbar border-4 border-white shadow-inner flex flex-col items-center justify-start lg:justify-center min-h-[400px] lg:min-h-0">
            <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl scale-[0.4] origin-top transform translate-y-0">
               <div dangerouslySetInnerHTML={{ 
                 __html: editedTemplate.content
                  .replace(/{{nama}}/g, '<b>[Nama Penerima]</b>')
                  .replace(/{{rt}}/g, '<b>[00]</b>')
                  .replace(/{{tanggal}}/g, '<b>[Tanggal Hari Ini]</b>')
               }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
        <button onClick={onClose} className="px-8 h-14 font-black uppercase text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Batal</button>
        <CartoonButton 
          onClick={() => onSave(editedTemplate)}
          variant="accent" 
          className="px-10 h-14 flex items-center gap-2"
        >
          <Save size={20} /> Simpan Template
        </CartoonButton>
      </div>
    </div>
  )
}

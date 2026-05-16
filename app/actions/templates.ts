'use client'

import { supabase } from '@/lib/supabase'

export interface Template {
  id: string
  name: string
  content: string
  category: string
  created_at?: string
}

export async function getTemplates() {
  const { data, error } = await supabase
    .from('invitation_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }
  return data as Template[]
}

export async function saveTemplate(template: Partial<Template>) {
  if (template.id && template.id.length > 20) { // Check if it's a real UUID
    const { data, error } = await supabase
      .from('invitation_templates')
      .update({
        name: template.name,
        content: template.content,
        category: template.category
      })
      .eq('id', template.id)
      .select()
    
    return { data, error }
  } else {
    const { data, error } = await supabase
      .from('invitation_templates')
      .insert({
        name: template.name,
        content: template.content,
        category: template.category
      })
      .select()
    
    return { data, error }
  }
}
export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('invitation_templates')
    .delete()
    .eq('id', id)
  
  return { error }
}


export async function uploadTemplateFile(file: File) {
  // Gunakan nama file asli yang dibersihkan atau ID unik pendek
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
  
  // Langsung ke root bucket saja untuk menghindari masalah folder
  const filePath = fileName

  const { data, error } = await supabase.storage
    .from('invitation-templates')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // Izinkan menimpa jika nama sama
    })

  if (error) {
    console.error('Upload Error:', error)
    return { error }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('invitation-templates')
    .getPublicUrl(filePath)

  return { publicUrl, error: null }
}

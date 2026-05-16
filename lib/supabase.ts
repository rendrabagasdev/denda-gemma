import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Division = {
  id: string
  name: string
  created_at: string
}

export type Member = {
  id: string
  nama: string
  rt: string
  divisi?: string // Kolom lama (untuk fallback)
  division_id?: string // Foreign Key baru
  divisions?: Division // Hasil Join
  jabatan?: string
  created_at: string
}

export type Fine = {
  id: string
  member_id: string
  type: 'awal' | 'rapat' | 'kerjabakti'
  amount: number
  description?: string
  is_paid: boolean
  created_at: string
}

export type Payment = {
  id: string
  member_id: string
  amount: number
  categories: string[] // comma separated or array
  created_at: string
}

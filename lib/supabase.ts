import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Member = {
  id: string
  nama: string
  rt: string
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

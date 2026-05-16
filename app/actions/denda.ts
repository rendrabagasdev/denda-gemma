'use server'

import { supabase } from '@/lib/supabase'
import { redis, CACHE_KEYS } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export async function getDashboardData(options?: { forceRefresh?: boolean }) {
  try {
    // 1. Try Redis Cache via Pipeline (unless forceRefresh is requested)
    if (!options?.forceRefresh) {
      const p = redis.pipeline()
      p.get(CACHE_KEYS.MEMBERS)
      p.get(CACHE_KEYS.FINES)
      const results = await p.exec()
      
      const cachedMembers = results[0] as any[] | null
      const cachedFines = results[1] as any[] | null

      if (cachedMembers && cachedFines) {
        return { members: cachedMembers, fines: cachedFines }
      }
    }

    // 2. Fallback to Supabase if any cache is missing
    const [{ data: membersData }, { data: finesData }] = await Promise.all([
      supabase.from('members').select('*, divisions(*)').order('nama'),
      supabase.from('fines').select('*')
    ])

    // 3. Update Cache in background (don't await to speed up response)
    if (membersData && finesData) {
      const updateP = redis.pipeline()
      updateP.set(CACHE_KEYS.MEMBERS, membersData, { ex: 3600 })
      updateP.set(CACHE_KEYS.FINES, finesData, { ex: 3600 })
      updateP.exec().catch(err => console.error('Redis background update error:', err))
    }

    return { 
      members: membersData || [], 
      fines: finesData || [] 
    }
  } catch (error) {
    console.error('Data Fetch Error:', error)
    // Absolute fallback
    const { data: membersData } = await supabase.from('members').select('*, divisions(*)').order('nama')
    const { data: finesData } = await supabase.from('fines').select('*')
    return { 
      members: membersData || [], 
      fines: finesData || [] 
    }
  }
}

export async function getCachedMembers() {
  try {
    const cached = await redis.get(CACHE_KEYS.MEMBERS)
    if (cached) return cached as any[]

    const { data, error } = await supabase.from('members').select('*, divisions(*)').order('nama')
    if (error) throw error

    if (data) await redis.set(CACHE_KEYS.MEMBERS, data, { ex: 3600 })
    return data
  } catch (error) {
    console.error('Redis Error (Members):', error)
    const { data } = await supabase.from('members').select('*, divisions(*)').order('nama')
    return data || []
  }
}

export async function getCachedFines() {
  try {
    const cached = await redis.get(CACHE_KEYS.FINES)
    if (cached) return cached as any[]

    const { data, error } = await supabase.from('fines').select('*')
    if (error) throw error

    if (data) await redis.set(CACHE_KEYS.FINES, data, { ex: 3600 })
    return data
  } catch (error) {
    console.error('Redis Error (Fines):', error)
    const { data } = await supabase.from('fines').select('*')
    return data || []
  }
}

export async function invalidateMembersCache() {
  await redis.del(CACHE_KEYS.MEMBERS)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function invalidateFinesCache() {
  await redis.del(CACHE_KEYS.FINES)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function getDivisions() {
  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('name')
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Fetch Divisions Error:', error)
    return []
  }
}

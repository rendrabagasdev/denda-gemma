'use server'

import { supabase } from '@/lib/supabase'
import { redis, CACHE_KEYS } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export async function getCachedMembers() {
  try {
    const cached = await redis.get(CACHE_KEYS.MEMBERS)
    if (cached) return cached as any[]

    const { data, error } = await supabase.from('members').select('*').order('nama')
    if (error) throw error

    if (data) await redis.set(CACHE_KEYS.MEMBERS, data, { ex: 3600 })
    return data
  } catch (error) {
    console.error('Redis Error (Members):', error)
    const { data } = await supabase.from('members').select('*').order('nama')
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

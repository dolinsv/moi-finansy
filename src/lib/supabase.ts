import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppData } from '../types'

const FAMILY_ID = 'family'

export type RemoteRow = {
  id: string
  payload: AppData
  updated_at: number
}

function readEnv() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || ''
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || ''
  return { url, key }
}

export function isSupabaseConfigured() {
  const { url, key } = readEnv()
  return Boolean(url && key)
}

let client: SupabaseClient | null = null

export function getSupabase() {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    const { url, key } = readEnv()
    client = createClient(url, key)
  }
  return client
}

export async function loadRemoteState(): Promise<{
  data: AppData
  updatedAt: number
} | null> {
  const sb = getSupabase()
  if (!sb) return null

  const { data, error } = await sb
    .from('app_state')
    .select('payload, updated_at')
    .eq('id', FAMILY_ID)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data?.payload) return null

  return {
    data: data.payload as AppData,
    updatedAt: Number(data.updated_at) || 0,
  }
}

export async function saveRemoteState(payload: AppData, updatedAt: number) {
  const sb = getSupabase()
  if (!sb) return

  const row: RemoteRow = {
    id: FAMILY_ID,
    payload,
    updated_at: updatedAt,
  }

  const { error } = await sb.from('app_state').upsert(row, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export function subscribeRemoteState(
  onChange: (data: AppData, updatedAt: number) => void,
) {
  const sb = getSupabase()
  if (!sb) return () => {}

  const channel = sb
    .channel('app_state_family')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state',
        filter: `id=eq.${FAMILY_ID}`,
      },
      (payload) => {
        const row = payload.new as RemoteRow | null
        if (!row?.payload) return
        onChange(row.payload, Number(row.updated_at) || Date.now())
      },
    )
    .subscribe()

  return () => {
    void sb.removeChannel(channel)
  }
}

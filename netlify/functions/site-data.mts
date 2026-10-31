import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { isAuthorized } from '../lib/auth.mts'

const STORE = 'portfolio'
const KEY = 'site-data'
const MAX_BYTES = 1_000_000

function isValid(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    data.content &&
    typeof data.content === 'object' &&
    Array.isArray(data.items) &&
    Array.isArray(data.games)
  )
}

export default async (req: Request) => {
  const store = getStore({ name: STORE, consistency: 'strong' })

  if (req.method === 'GET') {
    const data = await store.get(KEY, { type: 'json' })
    return Response.json(data ?? null, { headers: { 'cache-control': 'no-store' } })
  }

  if (!isAuthorized(req)) {
    return Response.json({ error: 'Not authorized. Please log in again.' }, { status: 401 })
  }

  const body = await req.text()
  if (body.length > MAX_BYTES) {
    return Response.json({ error: 'Content is too large.' }, { status: 413 })
  }

  let data: any
  try {
    data = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isValid(data)) {
    return Response.json({ error: 'Invalid site data.' }, { status: 400 })
  }

  const { content, items, games } = data
  await store.setJSON(KEY, { content, items, games, updatedAt: new Date().toISOString() })
  return Response.json({ ok: true })
}

export const config: Config = {
  path: '/api/site',
  method: ['GET', 'PUT'],
}

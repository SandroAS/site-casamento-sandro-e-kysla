import { getStore } from '@netlify/blobs'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
}

const VALID_STATUSES = new Set(['pending', 'confirmed', 'declined'])

function loadSeedGuests() {
  const seedPath = join(__dirname, '../../public/data/rsvp.json')
  const data = JSON.parse(readFileSync(seedPath, 'utf8'))
  return data.guests
}

function mergeGuests(seed, stored) {
  const statusById = new Map((stored || []).map((guest) => [guest.id, guest.status]))

  return seed.map((guest) => ({
    ...guest,
    status: statusById.get(guest.id) ?? guest.status ?? 'pending',
  }))
}

function guestIds(list) {
  return list.map((guest) => guest.id).join('|')
}

async function getGuests(store) {
  const seed = loadSeedGuests()
  const stored = await store.get('guests', { type: 'json' })
  const merged = mergeGuests(seed, stored)

  if (!stored?.length || guestIds(merged) !== guestIds(stored)) {
    await store.setJSON('guests', merged)
  }

  return merged
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const store = getStore('rsvp')

  try {
    if (req.method === 'GET') {
      const guests = await getGuests(store)
      return Response.json({ guests }, { headers: corsHeaders })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { id, status } = body

      if (!id || !VALID_STATUSES.has(status)) {
        return Response.json(
          { error: 'Dados inválidos.' },
          { status: 400, headers: corsHeaders },
        )
      }

      const guests = await getGuests(store)
      const index = guests.findIndex((guest) => guest.id === id)

      if (index === -1) {
        return Response.json(
          { error: 'Convidado não encontrado.' },
          { status: 404, headers: corsHeaders },
        )
      }

      guests[index] = { ...guests[index], status }
      await store.setJSON('guests', guests)

      return Response.json({ guests }, { headers: corsHeaders })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch {
    return Response.json(
      { error: 'Erro ao processar a solicitação.' },
      { status: 500, headers: corsHeaders },
    )
  }
}

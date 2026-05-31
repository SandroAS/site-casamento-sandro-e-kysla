import { ref, computed, onMounted } from 'vue'

const RSVP_API = '/.netlify/functions/rsvp'
const STORAGE_KEY = 'rsvp-guests'
const API_TIMEOUT_MS = 3000

const guests = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const usingLocalStorage = ref(false)

async function loadFromJson() {
  const res = await fetch('/data/rsvp.json')
  if (!res.ok) throw new Error('Não foi possível carregar a lista de convidados.')
  const data = await res.json()
  return data.guests
}

function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* ignore */
  }
  return null
}

function saveToLocalStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

async function fetchFromApi() {
  const res = await fetch(RSVP_API, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  if (!res.ok) return null

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null

  const data = await res.json()
  return data.guests?.length ? data.guests : null
}

async function load() {
  loading.value = true
  error.value = null
  usingLocalStorage.value = false

  try {
    const fromApi = await fetchFromApi()
    if (fromApi) {
      guests.value = fromApi
      return
    }

    usingLocalStorage.value = true
    const stored = loadFromLocalStorage()
    guests.value = stored || (await loadFromJson())
  } catch (e) {
    error.value = e.message || 'Não foi possível carregar a lista de convidados.'
    guests.value = []
  } finally {
    loading.value = false
  }
}

async function setStatus(guestId, status) {
  saving.value = true
  error.value = null

  const previous = guests.value.map((guest) => ({ ...guest }))
  guests.value = guests.value.map((guest) =>
    guest.id === guestId ? { ...guest, status } : guest,
  )

  try {
    if (!usingLocalStorage.value) {
      const res = await fetch(RSVP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guestId, status }),
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
      })

      if (res.ok) {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json()
          guests.value = data.guests
          return
        }
      }

      usingLocalStorage.value = true
    }

    saveToLocalStorage(guests.value)
  } catch {
    guests.value = previous
    error.value = 'Não foi possível salvar. Tente novamente.'
  } finally {
    saving.value = false
  }
}

function toggleStatus(guestId, targetStatus) {
  const guest = guests.value.find((item) => item.id === guestId)
  if (!guest || saving.value) return

  const nextStatus = guest.status === targetStatus ? 'pending' : targetStatus
  setStatus(guestId, nextStatus)
}

export function useRsvp() {
  const stats = computed(() => {
    const confirmed = guests.value.filter((g) => g.status === 'confirmed').length
    const declined = guests.value.filter((g) => g.status === 'declined').length
    const pending = guests.value.filter((g) => g.status === 'pending').length
    return { confirmed, declined, pending, total: guests.value.length }
  })

  onMounted(load)

  return {
    guests,
    loading,
    saving,
    error,
    stats,
    toggleStatus,
    reload: load,
  }
}

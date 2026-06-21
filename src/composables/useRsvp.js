import { ref, computed, onMounted } from 'vue'

const RSVP_API = '/.netlify/functions/rsvp'
const STATUS_STORAGE_KEY = 'rsvp-statuses'
const LEGACY_STORAGE_KEY = 'rsvp-guests'
const API_TIMEOUT_MS = 3000

const NO_STORE = { cache: 'no-store' }

const guests = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const usingLocalStorage = ref(false)

function listFingerprint(list) {
  return list.map((guest) => guest.id).join('|')
}

async function loadFromJson() {
  const res = await fetch('/data/rsvp.json', NO_STORE)
  if (!res.ok) throw new Error('Não foi possível carregar a lista de convidados.')
  const data = await res.json()
  return data.guests
}

function loadStatusesFromLocalStorage(fingerprint) {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY)
    if (!raw) return {}

    const data = JSON.parse(raw)
    if (!data?.statuses) return {}

    if (data.fingerprint === fingerprint) return data.statuses

    return data.statuses
  } catch {
    return {}
  }
}

function saveStatusesToLocalStorage(list, fingerprint) {
  const statuses = Object.fromEntries(list.map((guest) => [guest.id, guest.status]))
  localStorage.setItem(
    STATUS_STORAGE_KEY,
    JSON.stringify({ fingerprint, statuses }),
  )
}

function applyStatuses(seedGuests, statuses) {
  return seedGuests.map((guest) => ({
    ...guest,
    status: statuses[guest.id] ?? guest.status ?? 'pending',
  }))
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

async function fetchFromApi() {
  const res = await fetch(RSVP_API, {
    ...NO_STORE,
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
  clearLegacyStorage()

  try {
    const seed = await loadFromJson()
    const fingerprint = listFingerprint(seed)

    const fromApi = await fetchFromApi()
    if (fromApi) {
      guests.value = fromApi
      return
    }

    usingLocalStorage.value = true
    const statuses = loadStatusesFromLocalStorage(fingerprint)
    guests.value = applyStatuses(seed, statuses)
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
        ...NO_STORE,
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

    saveStatusesToLocalStorage(guests.value, listFingerprint(guests.value))
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

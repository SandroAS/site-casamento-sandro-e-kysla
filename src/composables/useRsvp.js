import { ref, computed, onMounted } from 'vue'

const guests = ref([])
const loading = ref(true)
const error = ref(null)

async function load() {
  loading.value = true
  error.value = null

  try {
    const res = await fetch('/data/rsvp.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('Não foi possível carregar a lista de convidados.')
    const data = await res.json()
    guests.value = data.guests
  } catch (e) {
    error.value = e.message || 'Não foi possível carregar a lista de convidados.'
    guests.value = []
  } finally {
    loading.value = false
  }
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
    error,
    stats,
    reload: load,
  }
}

import { ref, onMounted } from 'vue'
import { normalizeQuotas } from '../utils/format'

const siteData = ref(null)
const loading = ref(true)
const error = ref(null)

export function useSiteData() {
  async function load() {
    if (siteData.value) return siteData.value

    loading.value = true
    error.value = null

    try {
      const res = await fetch('/data/site.json')
      if (!res.ok) throw new Error('Não foi possível carregar os dados do site.')
      const data = await res.json()
      data.gifts = data.gifts.map((gift) => ({
        ...gift,
        quotas: normalizeQuotas(gift),
      }))
      siteData.value = data
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    load()
  })

  return { siteData, loading, error, load }
}

<script setup>
import { computed } from 'vue'
import { formatCurrency, giftStats } from '../utils/format'
import ProgressBar from './ui/ProgressBar.vue'

const props = defineProps({
  gift: { type: Object, required: true },
})

const emit = defineEmits(['contribute'])

const stats = computed(() => giftStats(props.gift))
const progressPercent = computed(() => {
  const { total, paid } = stats.value
  const reserved = props.gift.quotas.filter((q) => q.status === 'reserved').length
  return total > 0 ? ((paid + reserved) / total) * 100 : 0
})

const progressLabel = computed(() => {
  const { available, total } = stats.value
  return `${available} de ${total} cotas disponíveis`
})
</script>

<template>
  <article
    class="flex flex-col overflow-hidden rounded-2xl border border-olive/20 bg-white shadow-sm transition hover:border-olive/40 hover:shadow-md"
  >
    <div class="aspect-[3/2] overflow-hidden bg-stone-100">
      <img
        :src="gift.image"
        :alt="gift.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-serif text-xl font-medium text-stone-800">{{ gift.title }}</h3>
      <p class="mt-1 text-lg text-olive-dark">{{ formatCurrency(gift.totalValue) }}</p>

      <div class="mt-4">
        <ProgressBar :percent="progressPercent" :label="progressLabel" />
      </div>

      <button
        type="button"
        class="mt-5 w-full cursor-pointer rounded-full bg-olive py-3 text-sm tracking-wide text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="stats.available === 0"
        @click="emit('contribute', gift)"
      >
        {{ stats.available === 0 ? 'Todas as cotas preenchidas' : 'Contribuir com uma cota' }}
      </button>
    </div>
  </article>
</template>

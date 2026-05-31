<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  targetDate: { type: String, required: true },
  targetTime: { type: String, default: '16:00' },
})

const units = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let intervalId

function update() {
  const target = new Date(`${props.targetDate}T${props.targetTime}:00`)
  const diff = target - Date.now()

  if (diff <= 0) {
    units.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  units.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

onMounted(() => {
  update()
  intervalId = setInterval(update, 1000)
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="flex justify-center gap-4 sm:gap-8">
    <div v-for="(value, key) in units" :key="key" class="text-center">
      <span class="block font-serif text-3xl font-medium text-olive-dark tabular-nums sm:text-4xl">
        {{ String(value).padStart(2, '0') }}
      </span>
      <span class="mt-1 block text-[10px] tracking-widest-xl text-stone-500 uppercase">
        {{ key === 'days' ? 'dias' : key === 'hours' ? 'horas' : key === 'minutes' ? 'min' : 'seg' }}
      </span>
    </div>
  </div>
</template>

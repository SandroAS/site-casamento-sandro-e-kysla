<script setup>
import CountdownTimer from './CountdownTimer.vue'

defineProps({
  couple: { type: Object, required: true },
  event: { type: Object, required: true },
})
</script>

<template>
  <section id="inicio" class="scroll-mt-20 pt-24 pb-16">
    <div class="mx-auto max-w-2xl px-4 text-center">
      <p class="text-xs tracking-widest-xl text-stone-500 uppercase">Save the Date</p>

      <h1 class="font-script mt-3 text-5xl text-stone-900 sm:text-7xl">
        {{ couple.names }}
      </h1>

      <div class="mx-auto mt-8 max-w-md">
        <img
          :src="event.heroImage"
          :alt="`Ilustração do casamento de ${couple.names}`"
          class="w-full object-contain"
          width="480"
          height="640"
        />
      </div>

      <p class="mt-8 font-serif text-lg tracking-wide text-stone-700 sm:text-xl">
        {{ event.dateDisplay }}
      </p>

      <p class="mt-3 text-sm tracking-widest text-stone-600 uppercase">
        {{ event.venue }} · {{ event.city }} · {{ event.timeLabel }}
      </p>

      <div class="mt-12">
        <p class="mb-4 text-xs tracking-widest-xl text-olive uppercase">Faltam</p>
        <CountdownTimer :target-date="event.date" :target-time="event.time" />
      </div>
    </div>
  </section>
</template>

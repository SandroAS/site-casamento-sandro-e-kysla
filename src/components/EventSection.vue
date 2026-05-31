<script setup>
defineProps({
  couple: { type: Object, required: true },
  event: { type: Object, required: true },
})

const photos = [
  { src: '/images/casal/casal-1.jpg', alt: 'Sandro e Kysla na praia' },
  { src: '/images/casal/casal-2.jpg', alt: 'Noivado na praia' },
  { src: '/images/casal/casal-3.jpg', alt: 'Pedido de casamento na praia' },
]
</script>

<template>
  <section id="evento" class="scroll-mt-20 border-t border-stone-200/80 bg-white py-20">
    <div class="mx-auto max-w-4xl px-4">
      <h2 class="text-center font-serif text-3xl font-medium text-olive-dark sm:text-4xl">
        O casamento
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-center text-stone-600">
        Com muita alegria, {{ couple.displayNames.groom }} e {{ couple.displayNames.bride }}
        convidam você para celebrar este momento especial conosco.
      </p>

      <div class="mt-10 flex justify-center gap-4">
        <div
          v-for="(photo, i) in photos"
          :key="i"
          class="h-40 w-28 overflow-hidden rounded-lg border border-olive/20 sm:h-52 sm:w-36"
        >
          <img :src="photo.src" :alt="photo.alt" class="h-full w-full object-cover" loading="lazy" />
        </div>
      </div>

      <div
        class="mx-auto mt-12 max-w-lg rounded-2xl border border-olive/25 bg-cream p-8 text-center"
      >
        <p class="text-xs tracking-widest-xl text-olive uppercase">Data e local</p>
        <p class="mt-4 font-serif text-2xl text-stone-800">{{ event.dateLabel }}</p>
        <p class="mt-2 text-lg text-stone-700">{{ event.timeLabel }}</p>
        <p class="mt-4 font-medium tracking-wide text-stone-800 uppercase">{{ event.venue }}</p>
        <p class="mt-1 text-stone-600">{{ event.city }}</p>
        <a
          :href="event.mapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-6 inline-block rounded-full bg-olive px-8 py-2.5 text-sm tracking-wide text-white transition hover:bg-olive-dark"
        >
          Ver no mapa
        </a>
      </div>
    </div>
  </section>
</template>

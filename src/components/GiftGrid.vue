<script setup>
import GiftCard from './GiftCard.vue'

defineProps({
  gifts: { type: Array, required: true },
})

const emit = defineEmits(['contribute'])
</script>

<template>
  <section id="presentes" class="scroll-mt-20 py-20">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-center font-serif text-3xl font-medium text-olive-dark sm:text-4xl">
        Lista de presentes
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-center text-stone-600">
        Escolha um presente e contribua com o valor de uma cota via PIX. Você não precisa
        arcar com o valor total — dividimos cada item em parcelas para facilitar.
      </p>

      <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <GiftCard
          v-for="gift in gifts"
          :key="gift.id"
          :gift="gift"
          @contribute="emit('contribute', $event)"
        />
      </div>
    </div>
  </section>
</template>

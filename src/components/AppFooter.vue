<script setup>
defineProps({
  couple: { type: Object, required: true },
  event: { type: Object, required: true },
})
</script>

<template>
  <footer class="border-t border-stone-200/80 bg-olive-dark py-12 text-center text-cream">
    <p class="font-script text-4xl">{{ couple.names }}</p>
    <p class="mt-2 text-sm tracking-wide opacity-90">{{ event.dateLabel }}</p>
    <p class="mx-auto mt-6 max-w-md px-4 text-sm leading-relaxed opacity-80">
      Obrigado por fazer parte da nossa história. Sua presença e carinho significam tudo para nós.
    </p>
    <p class="mt-8 text-xs tracking-widest uppercase opacity-60">Com amor</p>
  </footer>
</template>

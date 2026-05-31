<script setup>
const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#evento', label: 'O casamento' },
  { href: '#presentes', label: 'Presentes' },
  { href: '#pix', label: 'PIX' },
]
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 border-b border-stone-200/80 bg-cream/90 backdrop-blur-sm"
  >
    <nav class="mx-auto flex max-w-5xl items-center justify-center gap-6 px-4 py-3 sm:gap-10">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        class="text-xs tracking-widest text-stone-600 uppercase transition hover:text-olive sm:text-sm"
      >
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>

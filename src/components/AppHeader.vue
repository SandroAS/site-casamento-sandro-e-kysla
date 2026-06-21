<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#evento', label: 'O casamento' },
  { href: '#presentes', label: 'Presentes' },
  { href: '#pix', label: 'PIX' },
  { href: '#confirmacao', label: 'Confirmação' },
]

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 border-b border-stone-200/80 bg-cream/90 backdrop-blur-sm"
  >
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:justify-center">
      <span class="font-serif text-sm text-olive-dark md:hidden">Kysla &amp; Sandro</span>

      <button
        type="button"
        class="relative z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-stone-600 transition hover:bg-olive/10 hover:text-olive md:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
        @click="toggleMenu"
      >
        <span class="sr-only">{{ menuOpen ? 'Fechar menu' : 'Abrir menu' }}</span>
        <svg
          v-if="!menuOpen"
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
        </svg>
        <svg
          v-else
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
        </svg>
      </button>

      <div class="hidden items-center gap-8 md:flex lg:gap-10">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm tracking-widest text-stone-600 uppercase transition hover:text-olive"
        >
          {{ link.label }}
        </a>
      </div>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="menuOpen"
        class="fixed inset-0 top-[57px] z-40 bg-stone-900/40 md:hidden"
        aria-hidden="true"
        @click="closeMenu"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="absolute top-full right-0 left-0 z-50 border-b border-stone-200/80 bg-cream px-4 py-4 shadow-lg md:hidden"
      >
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="block rounded-lg px-3 py-3 text-sm tracking-widest text-stone-700 uppercase transition hover:bg-olive/10 hover:text-olive"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
      </div>
    </Transition>
  </header>
</template>

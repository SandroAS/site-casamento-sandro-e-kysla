<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Copiar' },
  copiedLabel: { type: String, default: 'Copiado!' },
  onCopy: { type: Function, required: true },
})

const copied = ref(false)

async function handleClick() {
  const ok = await props.onCopy()
  if (ok) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <button
    type="button"
    class="cursor-pointer rounded-full border border-olive px-6 py-2.5 text-sm font-medium tracking-wide text-olive transition hover:bg-olive hover:text-white"
    @click="handleClick"
  >
    {{ copied ? copiedLabel : label }}
  </button>
</template>

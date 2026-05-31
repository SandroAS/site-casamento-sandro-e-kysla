<script setup>
defineProps({
  percent: { type: Number, default: 0 },
  label: { type: String, default: '' },
})
</script>

<template>
  <div class="w-full">
    <p v-if="label" class="mb-1.5 text-xs tracking-wide text-stone-500 uppercase">{{ label }}</p>
    <div class="h-1.5 overflow-hidden rounded-full bg-stone-200">
      <div
        class="h-full rounded-full bg-olive transition-all duration-500"
        :style="{ width: `${Math.min(100, Math.max(0, percent))}%` }"
      />
    </div>
  </div>
</template>

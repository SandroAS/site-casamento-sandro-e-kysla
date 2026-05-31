<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '../utils/format'
import { usePix } from '../composables/usePix'
import CopyButton from './ui/CopyButton.vue'

const props = defineProps({
  pixConfig: { type: Object, required: true },
  contact: { type: Object, default: null },
})

const amountInput = ref('')
const pixConfigRef = computed(() => props.pixConfig)
const { qrDataUrl, brCode, pixError, generating, generatePix, copyBrCode, copyKey } =
  usePix(pixConfigRef)

const parsedAmount = computed(() => {
  const raw = amountInput.value.replace(',', '.').trim()
  if (!raw) return 0
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
})

async function refreshQr() {
  await generatePix({
    amount: parsedAmount.value,
    description: props.pixConfig.descriptionDefault,
    txid: 'presentelivre',
  })
}

watch(amountInput, () => {
  refreshQr()
})

watch(
  () => props.pixConfig,
  () => refreshQr(),
  { immediate: true },
)
</script>

<template>
  <section id="pix" class="scroll-mt-20 border-t border-stone-200/80 bg-white py-20">
    <div class="mx-auto max-w-lg px-4 text-center">
      <h2 class="font-serif text-3xl font-medium text-olive-dark sm:text-4xl">PIX</h2>
      <p class="mt-4 text-stone-600">
        Prefere presentear em dinheiro? Use nossa chave PIX. O valor é opcional — deixe em branco
        e defina no app do seu banco.
      </p>

      <div class="mt-8 text-left">
        <label for="pix-amount" class="block text-sm tracking-wide text-stone-600 uppercase">
          Valor (opcional)
        </label>
        <div class="relative mt-2">
          <span class="absolute top-1/2 left-4 -translate-y-1/2 text-stone-400">R$</span>
          <input
            id="pix-amount"
            v-model="amountInput"
            type="text"
            inputmode="decimal"
            placeholder="0,00"
            class="w-full rounded-xl border border-olive/30 bg-cream py-3 pr-4 pl-12 font-serif text-lg outline-none focus:border-olive"
          />
        </div>
        <p v-if="parsedAmount > 0" class="mt-2 text-sm text-olive">
          QR Code com valor de {{ formatCurrency(parsedAmount) }}
        </p>
      </div>

      <div v-if="generating" class="mt-8 text-stone-500">Gerando QR Code…</div>
      <p v-else-if="pixError" class="mt-8 text-red-600">{{ pixError }}</p>

      <template v-else-if="qrDataUrl">
        <div class="mt-8 flex justify-center">
          <img :src="qrDataUrl" alt="QR Code PIX" class="rounded-lg" width="280" height="280" />
        </div>

        <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <CopyButton label="Copiar código PIX" :on-copy="copyBrCode" />
          <CopyButton label="Copiar chave" :on-copy="copyKey" />
        </div>
      </template>

      <div class="mt-8 rounded-xl border border-olive/20 bg-cream p-5 text-sm text-stone-600">
        <p><strong>Recebedor:</strong> {{ pixConfig.beneficiaryName }}</p>
        <p class="mt-1">
          <strong>Chave:</strong> {{ pixConfig.keyDisplay || pixConfig.key }}
        </p>
      </div>
    </div>
  </section>
</template>

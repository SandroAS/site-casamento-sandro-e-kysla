<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '../utils/format'
import { usePix } from '../composables/usePix'
import CopyButton from './ui/CopyButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  gift: { type: Object, default: null },
  pixConfig: { type: Object, required: true },
  contact: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const selectedQuotas = ref([])
const pixGenerated = ref(false)
const pixConfigRef = computed(() => props.pixConfig)
const { qrDataUrl, pixError, generating, generatePix, copyBrCode, copyKey, resetPix } =
  usePix(pixConfigRef)

const availableQuotas = computed(() => {
  if (!props.gift) return []
  return props.gift.quotas.filter((q) => q.status === 'available')
})

const selectedTotal = computed(() =>
  selectedQuotas.value.reduce((sum, q) => sum + q.value, 0),
)

const selectedCount = computed(() => selectedQuotas.value.length)

const selectedLabel = computed(() => {
  if (selectedCount.value === 0) return ''
  if (selectedCount.value === 1) {
    const num = selectedQuotas.value[0].id.split('-').pop()
    return `cota ${num}`
  }
  const nums = selectedQuotas.value
    .map((q) => q.id.split('-').pop())
    .sort((a, b) => Number(a) - Number(b))
    .join(', ')
  return `cotas ${nums}`
})

const whatsappUrl = computed(() => {
  if (!props.contact?.whatsapp) return null
  const msg = encodeURIComponent(props.contact.whatsappMessage || 'Comprovante PIX casamento')
  return `https://wa.me/${props.contact.whatsapp.replace(/\D/g, '')}?text=${msg}`
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      selectedQuotas.value = []
      pixGenerated.value = false
      resetPix()
    }
  },
)

function isSelected(quota) {
  return selectedQuotas.value.some((q) => q.id === quota.id)
}

function toggleQuota(quota) {
  if (isSelected(quota)) {
    selectedQuotas.value = selectedQuotas.value.filter((q) => q.id !== quota.id)
  } else {
    selectedQuotas.value = [...selectedQuotas.value, quota]
  }
}

function buildTxid(quotas) {
  const base = props.gift.id.replace(/[^a-zA-Z0-9]/g, '')
  const nums = quotas
    .map((q) => q.id.split('-').pop())
    .sort((a, b) => Number(a) - Number(b))
    .join('')
  return `${base}${nums}`.slice(0, 25)
}

function buildDescription(quotas) {
  const title = `Presente: ${props.gift.title}`
  if (quotas.length === 1) return title.slice(0, 72)

  const nums = quotas
    .map((q) => q.id.split('-').pop())
    .sort((a, b) => Number(a) - Number(b))
    .join(', ')
  return `${title} (${nums})`.slice(0, 72)
}

async function confirmSelection() {
  if (selectedQuotas.value.length === 0) return

  const quotas = [...selectedQuotas.value].sort(
    (a, b) => Number(a.id.split('-').pop()) - Number(b.id.split('-').pop()),
  )

  await generatePix({
    amount: quotas.reduce((sum, q) => sum + q.value, 0),
    description: buildDescription(quotas),
    txid: buildTxid(quotas),
  })

  pixGenerated.value = true
}

function backToSelection() {
  pixGenerated.value = false
  resetPix()
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && gift"
      class="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      :aria-label="`PIX para ${gift.title}`"
    >
      <div class="absolute inset-0 bg-stone-900/50" @click="close" />

      <div
        class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-cream p-6 shadow-xl sm:p-8"
      >
        <button
          type="button"
          class="absolute top-4 right-4 cursor-pointer text-2xl leading-none text-stone-400 hover:text-stone-700"
          aria-label="Fechar"
          @click="close"
        >
          ×
        </button>

        <h3 class="pr-8 font-serif text-2xl text-olive-dark">{{ gift.title }}</h3>
        <p class="mt-1 text-stone-600">Valor total: {{ formatCurrency(gift.totalValue) }}</p>

        <template v-if="!pixGenerated">
          <p class="mt-6 text-sm text-stone-600">
            Selecione uma ou mais cotas disponíveis:
          </p>
          <ul class="mt-3 space-y-2">
            <li v-for="quota in availableQuotas" :key="quota.id">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition"
                :class="
                  isSelected(quota)
                    ? 'border-olive bg-olive/10'
                    : 'border-olive/30 hover:border-olive hover:bg-olive/5'
                "
                :aria-pressed="isSelected(quota)"
                @click="toggleQuota(quota)"
              >
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition"
                  :class="
                    isSelected(quota)
                      ? 'border-olive bg-olive text-white'
                      : 'border-olive/40 bg-white'
                  "
                  aria-hidden="true"
                >
                  <svg
                    v-if="isSelected(quota)"
                    class="h-3 w-3"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </span>
                <span>
                  <span class="font-medium text-olive-dark">{{ formatCurrency(quota.value) }}</span>
                  <span class="ml-2 text-xs text-stone-500">— Cota {{ quota.id.split('-').pop() }}</span>
                </span>
              </button>
            </li>
          </ul>
          <p v-if="availableQuotas.length === 0" class="mt-4 text-stone-500">
            Não há cotas disponíveis no momento.
          </p>

          <div
            v-if="selectedCount > 0"
            class="mt-5 rounded-xl border border-olive/20 bg-white p-4"
          >
            <p class="text-sm text-stone-600">
              {{ selectedCount }} {{ selectedCount === 1 ? 'cota selecionada' : 'cotas selecionadas' }}
              ({{ selectedLabel }})
            </p>
            <p class="mt-1 text-lg font-medium text-olive-dark">
              Total: {{ formatCurrency(selectedTotal) }}
            </p>
          </div>

          <button
            type="button"
            class="mt-5 w-full cursor-pointer rounded-full bg-olive py-3 text-sm tracking-wide text-white transition hover:bg-olive-dark disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="selectedCount === 0"
            @click="confirmSelection"
          >
            {{ selectedCount === 0 ? 'Selecione ao menos uma cota' : 'Confirmar e gerar PIX' }}
          </button>
        </template>

        <template v-else>
          <p class="mt-6 text-center text-lg font-medium text-olive-dark">
            Pague {{ formatCurrency(selectedTotal) }} via PIX
          </p>
          <p class="mt-1 text-center text-sm text-stone-500">
            {{ selectedCount === 1 ? '1 cota' : `${selectedCount} cotas` }} ({{ selectedLabel }})
          </p>

          <div v-if="generating" class="mt-8 text-center text-stone-500">Gerando QR Code…</div>

          <p v-else-if="pixError" class="mt-8 text-center text-red-600">{{ pixError }}</p>

          <template v-else-if="qrDataUrl">
            <div class="mt-6 flex justify-center">
              <img :src="qrDataUrl" alt="QR Code PIX" class="rounded-lg" width="280" height="280" />
            </div>

            <div class="mt-6 flex flex-col items-center gap-3">
              <CopyButton label="Copiar código PIX" :on-copy="copyBrCode" />
              <CopyButton label="Copiar chave PIX" :on-copy="copyKey" />
            </div>

            <p class="mt-4 text-center text-sm text-stone-600">
              Chave: <strong>{{ pixConfig.keyDisplay || pixConfig.key }}</strong>
            </p>
            <p class="mt-1 text-center text-xs text-stone-500">
              {{ pixConfig.beneficiaryName }}
            </p>
          </template>

          <button
            type="button"
            class="mt-4 w-full cursor-pointer text-sm text-olive underline"
            @click="backToSelection"
          >
            Escolher outras cotas
          </button>

          <div class="mt-6 rounded-xl border border-olive/20 bg-white p-4 text-sm text-stone-600">
            <p>
              Após o pagamento, envie o comprovante para os noivos. Eles confirmarão o pagamento
              {{ selectedCount === 1 ? 'da cota selecionada' : 'das cotas selecionadas' }} no
              arquivo de configuração do site.
            </p>
            <a
              v-if="whatsappUrl"
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-block font-medium text-olive hover:underline"
            >
              Enviar comprovante pelo WhatsApp
            </a>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

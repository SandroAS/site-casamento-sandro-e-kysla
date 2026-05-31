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

const selectedQuota = ref(null)
const pixConfigRef = computed(() => props.pixConfig)
const { qrDataUrl, pixError, generating, generatePix, copyBrCode, copyKey, resetPix } =
  usePix(pixConfigRef)

const availableQuotas = computed(() => {
  if (!props.gift) return []
  return props.gift.quotas.filter((q) => q.status === 'available')
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
      selectedQuota.value = null
      resetPix()
    }
  },
)

async function selectQuota(quota) {
  selectedQuota.value = quota
  const desc = `Presente: ${props.gift.title}`.slice(0, 72)
  await generatePix({
    amount: quota.value,
    description: desc,
    txid: quota.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25),
  })
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

        <template v-if="!selectedQuota">
          <p class="mt-6 text-sm text-stone-600">Selecione uma cota disponível:</p>
          <ul class="mt-3 space-y-2">
            <li v-for="quota in availableQuotas" :key="quota.id">
              <button
                type="button"
                class="w-full cursor-pointer rounded-xl border border-olive/30 px-4 py-3 text-left transition hover:border-olive hover:bg-olive/5"
                @click="selectQuota(quota)"
              >
                <span class="font-medium text-olive-dark">{{ formatCurrency(quota.value) }}</span>
                <span class="ml-2 text-xs text-stone-500">— Cota {{ quota.id.split('-').pop() }}</span>
              </button>
            </li>
          </ul>
          <p v-if="availableQuotas.length === 0" class="mt-4 text-stone-500">
            Não há cotas disponíveis no momento.
          </p>
        </template>

        <template v-else>
          <p class="mt-6 text-center text-lg font-medium text-olive-dark">
            Pague {{ formatCurrency(selectedQuota.value) }} via PIX
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
            @click="selectedQuota = null"
          >
            Escolher outra cota
          </button>

          <div class="mt-6 rounded-xl border border-olive/20 bg-white p-4 text-sm text-stone-600">
            <p>
              Após o pagamento, envie o comprovante para os noivos. Eles marcarão a cota como
              reservada ou paga no arquivo de configuração do site.
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

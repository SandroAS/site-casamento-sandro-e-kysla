<script setup>
import { ref, computed } from 'vue'
import { useRsvp } from '../composables/useRsvp'

const props = defineProps({
  contact: { type: Object, required: true },
})

const { guests, loading, error, stats } = useRsvp()

const search = ref('')

const filteredGuests = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return guests.value
  return guests.value.filter((guest) => guest.name.toLowerCase().includes(query))
})

const statusLabel = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  declined: 'Não vai',
}

const statusClass = {
  pending: 'bg-stone-100 text-stone-600',
  confirmed: 'bg-olive/15 text-olive-dark',
  declined: 'bg-stone-200 text-stone-700',
}

function whatsappUrl(message) {
  const phone = props.contact.whatsapp.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

function confirmUrl(guestName) {
  return whatsappUrl(
    `Olá! Gostaria de confirmar presença no casamento para ${guestName}.`,
  )
}

function declineUrl(guestName) {
  return whatsappUrl(
    `Olá! Gostaria de informar que não poderei comparecer ao casamento (convidado: ${guestName}).`,
  )
}
</script>

<template>
  <section id="confirmacao" class="scroll-mt-20 border-t border-stone-200/80 bg-cream py-20">
    <div class="mx-auto max-w-3xl px-4">
      <h2 class="text-center font-serif text-3xl font-medium text-olive-dark sm:text-4xl">
        Confirmação de presença
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-center text-stone-600">
        Encontre seu nome na lista e envie uma mensagem pelo WhatsApp para confirmar ou
        desistir da presença. Os noivos atualizarão o status aqui no site.
      </p>

      <div v-if="loading" class="mt-12 text-center text-stone-500">Carregando convidados…</div>

      <template v-else>
        <div class="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <span class="rounded-full bg-olive/15 px-4 py-1.5 text-olive-dark">
            {{ stats.confirmed }} confirmados
          </span>
          <span class="rounded-full bg-stone-200 px-4 py-1.5 text-stone-700">
            {{ stats.declined }} não vão
          </span>
          <span class="rounded-full bg-stone-100 px-4 py-1.5 text-stone-600">
            {{ stats.pending }} pendentes
          </span>
        </div>

        <div class="mt-8">
          <label for="rsvp-search" class="sr-only">Buscar convidado</label>
          <input
            id="rsvp-search"
            v-model="search"
            type="search"
            placeholder="Buscar por nome…"
            class="w-full rounded-xl border border-olive/30 bg-white px-4 py-3 outline-none focus:border-olive"
          />
        </div>

        <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>

        <ul class="mt-6 space-y-2">
          <li
            v-for="guest in filteredGuests"
            :key="guest.id"
            class="flex flex-col gap-3 rounded-xl border border-olive/20 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="font-medium text-stone-800">{{ guest.name }}</p>
              <span
                class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs"
                :class="statusClass[guest.status]"
              >
                {{ statusLabel[guest.status] }}
              </span>
            </div>

            <div class="flex shrink-0 gap-2">
              <a
                :href="confirmUrl(guest.name)"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-full px-4 py-2 text-sm transition"
                :class="
                  guest.status === 'confirmed'
                    ? 'bg-olive text-white'
                    : 'border border-olive/30 text-olive-dark hover:border-olive hover:bg-olive/5'
                "
              >
                Confirmo
              </a>
              <a
                :href="declineUrl(guest.name)"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-full px-4 py-2 text-sm transition"
                :class="
                  guest.status === 'declined'
                    ? 'bg-stone-700 text-white'
                    : 'border border-stone-300 text-stone-700 hover:border-stone-500 hover:bg-stone-50'
                "
              >
                Não vou
              </a>
            </div>
          </li>
        </ul>

        <p v-if="filteredGuests.length === 0" class="mt-6 text-center text-stone-500">
          Nenhum convidado encontrado com esse nome.
        </p>
      </template>
    </div>
  </section>
</template>

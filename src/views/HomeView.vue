<script setup>
import { ref } from 'vue'
import { useSiteData } from '../composables/useSiteData'
import AppHeader from '../components/AppHeader.vue'
import HeroSection from '../components/HeroSection.vue'
import EventSection from '../components/EventSection.vue'
import GiftGrid from '../components/GiftGrid.vue'
import FreePixSection from '../components/FreePixSection.vue'
import RsvpSection from '../components/RsvpSection.vue'
import QuotaPixModal from '../components/QuotaPixModal.vue'
import AppFooter from '../components/AppFooter.vue'

const { siteData, loading, error } = useSiteData()

const modalOpen = ref(false)
const selectedGift = ref(null)

function openModal(gift) {
  selectedGift.value = gift
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selectedGift.value = null
}
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <div v-if="loading" class="flex min-h-screen items-center justify-center pt-20">
      <p class="text-stone-500">Carregando…</p>
    </div>

    <div v-else-if="error" class="flex min-h-screen items-center justify-center pt-20">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <template v-else-if="siteData">
      <main>
        <HeroSection :couple="siteData.couple" :event="siteData.event" />
        <EventSection :couple="siteData.couple" :event="siteData.event" />
        <GiftGrid :gifts="siteData.gifts" @contribute="openModal" />
        <FreePixSection :pix-config="siteData.pix" :contact="siteData.contact" />
        <RsvpSection />
      </main>

      <AppFooter :couple="siteData.couple" :event="siteData.event" />

      <QuotaPixModal
        :open="modalOpen"
        :gift="selectedGift"
        :pix-config="siteData.pix"
        :contact="siteData.contact"
        @close="closeModal"
      />
    </template>
  </div>
</template>

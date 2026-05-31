import { ref } from 'vue'
import { createStaticPix, hasError } from 'pix-utils'
import QRCode from 'qrcode'

function sanitizePixText(text, maxLen) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .slice(0, maxLen)
}

function formatPixKey(key, keyType) {
  if (keyType === 'phone') {
    const digits = key.replace(/\D/g, '')
    if (digits.startsWith('55')) return `+${digits}`
    return `+55${digits}`
  }
  return key
}

export function usePix(pixConfig) {
  const qrDataUrl = ref('')
  const brCode = ref('')
  const pixError = ref(null)
  const generating = ref(false)

  async function generatePix({ amount = 0, description = '', txid = '***' } = {}) {
    generating.value = true
    pixError.value = null
    qrDataUrl.value = ''
    brCode.value = ''

    const config = pixConfig.value || pixConfig

    const params = {
      merchantName: sanitizePixText(config.beneficiaryName, 25),
      merchantCity: sanitizePixText(config.city, 15),
      pixKey: formatPixKey(config.key, config.keyType),
      infoAdicional: description
        ? sanitizePixText(description, 72)
        : sanitizePixText(config.descriptionDefault || 'Presente casamento', 72),
      transactionAmount: amount > 0 ? Number(amount) : 0,
      txid: sanitizePixText(txid, 25),
    }

    const pix = createStaticPix(params)

    if (hasError(pix)) {
      pixError.value = pix.message || 'Erro ao gerar PIX.'
      generating.value = false
      return null
    }

    const code = pix.toBRCode()
    brCode.value = code

    try {
      qrDataUrl.value = await QRCode.toDataURL(code, {
        width: 280,
        margin: 2,
        color: { dark: '#4a5a38', light: '#fafaf8' },
      })
    } catch {
      pixError.value = 'Erro ao gerar QR Code.'
    }

    generating.value = false
    return code
  }

  async function copyBrCode() {
    if (!brCode.value) return false
    try {
      await navigator.clipboard.writeText(brCode.value)
      return true
    } catch {
      return false
    }
  }

  async function copyKey() {
    const config = pixConfig.value || pixConfig
    try {
      await navigator.clipboard.writeText(config.key)
      return true
    } catch {
      return false
    }
  }

  function resetPix() {
    qrDataUrl.value = ''
    brCode.value = ''
    pixError.value = null
  }

  return {
    qrDataUrl,
    brCode,
    pixError,
    generating,
    generatePix,
    copyBrCode,
    copyKey,
    resetPix,
  }
}

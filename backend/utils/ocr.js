// Receipt OCR parser (currently non-OCR fallback).
// We do not return fake totals/merchants. Once you add a real OCR provider,
// replace this implementation.

export function parseReceipt(filename = 'receipt', _fileBytes = Buffer.alloc(0)) {
  const safeName = String(filename || 'receipt').replace(/\.[a-z0-9]+$/i, '')
  const nowIso = new Date().toISOString()

  return {
    merchant: safeName || 'Receipt',
    total: null,
    date: nowIso,
    items: [],
    parsed_text: 'OCR parsing is not enabled in this build.',
  }
}


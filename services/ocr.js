/**
 * OCR adapter boundary. Replace the implementation with a provider (Vision API,
 * on-device ML, etc.) without changing UI code.
 */
export async function extractText(imageFile) {
  if (!imageFile) throw new Error('An image is required for OCR.');
  return { text: '', blocks: [], source: imageFile.name };
}

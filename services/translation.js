/** Translation adapter boundary, including a natural travel-context explanation. */
export const sampleTranslation = {
  text: 'Karasuma Oike',
  native: 'からすまおいけ',
  romanisation: 'karasuma-oike',
  natural: 'This is the station name — your stop on the Tozai subway line.'
};

export async function translateText(text, options = {}) {
  return { text, translation: '', romanisation: '', naturalNote: '', ...options };
}

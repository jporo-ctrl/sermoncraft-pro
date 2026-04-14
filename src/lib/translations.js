export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "sw", label: "Swahili", nativeLabel: "Kiswahili" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
  { code: "zh", label: "Chinese (Simplified)", nativeLabel: "中文" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

export const LANGUAGE_NAMES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  sw: "Swahili",
  yo: "Yoruba",
  ig: "Igbo",
  ha: "Hausa",
  ar: "Arabic",
  zh: "Chinese (Simplified)",
  hi: "Hindi",
};

export const PREFERRED_BIBLE_VERSIONS = {
  en: "NIV",
  es: "RVR1960",
  fr: "LSG",
  pt: "NVI-PT",
  sw: "SUV",
  yo: "NIV",
  ig: "NIV",
  ha: "NIV",
  ar: "NAV",
  zh: "CUNP",
  hi: "ERV-HI",
};

export function getLanguageName(code) {
  return LANGUAGE_NAMES[code] || "English";
}

export function getPreferredBibleVersion(code) {
  return PREFERRED_BIBLE_VERSIONS[code] || "NIV";
}
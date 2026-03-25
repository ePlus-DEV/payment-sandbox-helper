import en from "../locales/en.json";
import vi from "../locales/vi.json";

export type Lang = "en" | "vi";
export type T = typeof en;

export const LANG_KEY = "sandbox_pay_lang";

export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

export const translations: Record<Lang, T> = { en, vi };

export function loadLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) ?? "en";
}

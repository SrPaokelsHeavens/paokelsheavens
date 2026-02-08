import { ui, defaultLang, languages } from './ui';

/**
 * Extrae el idioma de la URL.
 */
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

/**
 * Proporciona una función de traducción para el idioma especificado.
 */
export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    // @ts-ignore - Indexing with a generic string key
    return ui[lang][key] || ui[defaultLang][key];
  };
}

/**
 * Genera una ruta localizada basada en el idioma actual.
 */
export function useLocalizedPath(lang: keyof typeof ui) {
  return function l(path: string) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return lang === defaultLang ? `/${cleanPath}` : `/${lang}/${cleanPath}`;
  };
}

/**
 * Obtiene el slug de una novela o capítulo sin el prefijo del idioma.
 */
export function getCleanSlug(slug: string) {
    return slug.split('/').filter(Boolean).join('/');
}

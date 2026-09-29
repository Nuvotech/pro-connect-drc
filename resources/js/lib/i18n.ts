export type Locale = 'fr' | 'en';

export type Replacements = Record<string, string | number>;

let activeLocale: Locale = 'fr';
let activeTranslations: Record<string, string> = {};

/**
 * Point `t()` at the current page's language. Called by `TranslationScope`
 * while rendering, before any page content renders.
 */
export function setTranslations(
    locale: Locale,
    translations: Record<string, string> | undefined,
): void {
    activeLocale = locale;
    activeTranslations = translations ?? {};
}

/**
 * The visitor's current language.
 */
export function currentLocale(): Locale {
    return activeLocale;
}

/**
 * Replace Laravel-style `:name` placeholders, longest names first so
 * `:names` isn't clobbered by `:name`.
 */
function replacePlaceholders(
    text: string,
    replacements?: Replacements,
): string {
    if (!replacements) {
        return text;
    }

    return Object.keys(replacements)
        .sort((a, b) => b.length - a.length)
        .reduce(
            (result, key) =>
                result.replaceAll(`:${key}`, String(replacements[key])),
            text,
        );
}

/**
 * Translate an interface string. Keys are the English text, so English
 * needs no translation file and a missing French string falls back to
 * English. Call it while rendering, never at module level.
 */
export function t(text: string, replacements?: Replacements): string {
    return replacePlaceholders(activeTranslations[text] || text, replacements);
}

/**
 * A category's name in the other language, shown under its main name:
 * English when browsing in French, French when browsing in English.
 */
export function otherName(item: {
    name: string;
    nameFr?: string | null;
    nameEn?: string | null;
}): string {
    const other = activeLocale === 'fr' ? item.nameEn : item.nameFr;

    return other && other !== item.name ? other : '';
}

/**
 * The Intl locale for dates in the visitor's language.
 */
export function dateLocale(): string {
    return activeLocale === 'fr' ? 'fr-FR' : 'en-GB';
}

/**
 * A date in the visitor's language, e.g. "29 sept. 2026" or "29 Sept 2026".
 */
export function formatDate(
    value: string | number | Date,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    },
): string {
    return new Date(value).toLocaleDateString(
        activeLocale === 'fr' ? 'fr-FR' : 'en-GB',
        options,
    );
}

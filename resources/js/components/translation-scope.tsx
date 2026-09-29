import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { setTranslations } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

/**
 * The outermost layout of every page. Loads the page's language into `t()`
 * while rendering, so everything below it renders in that language, and
 * keeps the document's `lang` attribute in step.
 */
export default function TranslationScope({
    children,
}: {
    children: ReactNode;
}) {
    const { locale, translations } = usePage().props;
    const activeLocale: Locale = locale === 'en' ? 'en' : 'fr';

    setTranslations(activeLocale, translations);

    useEffect(() => {
        document.documentElement.lang = activeLocale;
    }, [activeLocale]);

    return children;
}

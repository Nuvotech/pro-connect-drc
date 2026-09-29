import { usePage } from '@inertiajs/react';
import { currentLocale, formatDate, t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export type { Locale };

/**
 * The translator and the active language, for components that need the
 * locale itself (such as the language switch).
 */
export function useTranslation() {
    const { locale } = usePage().props;

    return {
        t,
        formatDate,
        locale: (locale ?? currentLocale()) as Locale,
    };
}

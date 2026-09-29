import { router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import type { Locale } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { update as updateLocale } from '@/routes/locale';

const options: { value: Locale; label: string; name: string }[] = [
    { value: 'fr', label: 'FR', name: 'Français' },
    { value: 'en', label: 'EN', name: 'English' },
];

/**
 * An FR | EN switch. `tone` matches the public site or the workspace.
 */
export default function LanguageSwitch({
    tone = 'public',
    className,
}: {
    tone?: 'public' | 'workspace';
    className?: string;
}) {
    const { t, locale } = useTranslation();

    function choose(value: Locale) {
        if (value === locale) {
            return;
        }

        router.post(
            updateLocale.url(),
            { locale: value },
            { preserveScroll: true, preserveState: false },
        );
    }

    return (
        <div
            role="radiogroup"
            aria-label={t('Language')}
            className={cn(
                'flex shrink-0 rounded-full border p-0.5',
                tone === 'public'
                    ? 'border-outline-variant'
                    : 'border-zinc-200',
                className,
            )}
        >
            {options.map((option) => {
                const isSelected = option.value === locale;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        lang={option.value}
                        title={option.name}
                        onClick={() => choose(option.value)}
                        className={cn(
                            'h-7 min-w-10 cursor-pointer rounded-full px-2.5 text-xs font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none',
                            tone === 'public'
                                ? isSelected
                                    ? 'bg-primary text-on-primary focus-visible:ring-primary'
                                    : 'text-on-surface-variant hover:text-primary focus-visible:ring-primary'
                                : isSelected
                                  ? 'bg-zinc-900 text-white focus-visible:ring-zinc-400'
                                  : 'text-zinc-500 hover:text-zinc-900 focus-visible:ring-zinc-400',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

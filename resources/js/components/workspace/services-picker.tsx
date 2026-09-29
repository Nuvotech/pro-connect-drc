import CategoryCombobox from '@/components/workspace/category-combobox';
import { useCategories } from '@/hooks/use-categories';
import { t } from '@/lib/i18n';

export type ServiceGroup = {
    label: string;
    options: { slug: string; name: string; nameFr?: string }[];
};

/**
 * Searchable dropdown of the services a professional offers, grouped by
 * type. Submits as `categories[]`. Pass `groups` to use a specific list,
 * such as the one sent to the public join form; otherwise the shared
 * categories from the database are used.
 */
export default function ServicesPicker({
    selected,
    onChange,
    error,
    groups,
}: {
    selected: string[];
    groups?: ServiceGroup[];
    onChange: (selected: string[]) => void;
    error?: string;
}) {
    const { serviceGroups } = useCategories();

    return (
        <div
            id="services"
            className="flex scroll-mt-24 flex-col gap-1.5 sm:col-span-2"
        >
            <label
                htmlFor="services-search"
                className="flex items-baseline justify-between gap-2 text-sm font-medium text-zinc-900"
            >
                {t('Services')}
                <span className="text-xs font-normal text-zinc-500 tabular-nums">
                    {selected.length} {t('selected')}
                </span>
            </label>
            <CategoryCombobox
                id="services-search"
                groups={groups ?? serviceGroups}
                selected={selected}
                onChange={onChange}
                placeholder={t('Search, e.g. plumber, maçon, notaire…')}
                isInvalid={Boolean(error)}
            />
            {selected.map((slug) => (
                <input
                    key={slug}
                    type="hidden"
                    name="categories[]"
                    value={slug}
                />
            ))}
            {error && (
                <p className="text-xs font-medium text-zinc-900">{error}</p>
            )}
        </div>
    );
}

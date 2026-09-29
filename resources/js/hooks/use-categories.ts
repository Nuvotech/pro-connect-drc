import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { ServiceGroup } from '@/components/workspace/services-picker';
import type { CategoryGroup, City, SharedCategory } from '@/types';

const groupLabels: Record<CategoryGroup, string> = {
    trade: 'Trades',
    business: 'Business services',
    vehicle: 'Vehicle & equipment rental',
};

/**
 * The categories from the database, shared with every signed-in page, so
 * categories the admin adds show up everywhere.
 */
export function useCategories() {
    const { categories } = usePage().props;

    return useMemo(() => {
        const list: SharedCategory[] = categories ?? [];
        const names = new Map(
            list.map((category) => [category.slug, category.name]),
        );

        const serviceGroups: ServiceGroup[] = (['trade', 'business'] as const)
            .map((group) => ({
                label: groupLabels[group],
                options: list
                    .filter((category) => category.group === group)
                    .map(({ slug, name, nameFr }) => ({
                        slug,
                        name,
                        nameFr,
                    })),
            }))
            .filter((group) => group.options.length > 0);

        const vehicleOptions = list
            .filter((category) => category.group === 'vehicle')
            .map(({ slug, name }) => ({ value: slug, label: name }));

        const bySlug = new Map(
            list.map((category) => [category.slug, category]),
        );

        return {
            categories: list,
            serviceGroups,
            vehicleOptions,
            categoryName: (slug: string) => names.get(slug) ?? slug,
            findCategory: (slug: string | null | undefined) =>
                slug ? bySlug.get(slug) : undefined,
        };
    }, [categories]);
}

/**
 * The cities and communes from the database, shared with every page.
 */
export function useCities() {
    const { cities } = usePage().props;

    return useMemo(() => {
        const list: City[] = cities ?? [];

        return {
            cities: list,
            findCity: (name: string | null | undefined) =>
                list.find((city) => city.name === name),
        };
    }, [cities]);
}

import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Clock, Plus, Users } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { applications } from '@/routes/admin';
import { create, show } from '@/routes/admin/professionals';
import type { OnboardedProfessional, Paginated } from '@/types';
import { t } from '@/lib/i18n';

function initialsOf(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function ProfessionalsIndex({
    professionals,
}: {
    professionals: Paginated<OnboardedProfessional>;
}) {
    return (
        <>
            <Head title={t('Professionals')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            {t('Professionals')}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {t(
                                'Service providers, technicians and businesses on ProConnect.',
                            )}
                        </p>
                    </div>
                    <Link
                        href={create()}
                        className="inline-flex h-9 items-center gap-2 self-start rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container sm:self-auto"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        {t('Onboard professional')}
                    </Link>
                </div>

                {professionals.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <Users
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-sm font-medium text-zinc-900">
                                {t('No professionals yet')}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                                {t(
                                    'Onboard your first service provider to see them here.',
                                )}
                            </p>
                        </div>
                        <Link
                            href={create()}
                            className="mt-1 inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            {t('Onboard professional')}
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Name')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Category')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Location')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Phone')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Status')}
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            {t('Added')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {professionals.data.map((professional) => (
                                        <tr
                                            key={professional.id}
                                            className="transition-colors duration-200 hover:bg-zinc-50"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {professional.photoUrl ? (
                                                        <img
                                                            src={
                                                                professional.photoUrl
                                                            }
                                                            alt=""
                                                            className="size-9 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                                                            {initialsOf(
                                                                professional.fullName,
                                                            )}
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={show(
                                                                professional.id,
                                                            )}
                                                            className="block truncate font-medium text-zinc-900 underline-offset-2 hover:underline"
                                                        >
                                                            {
                                                                professional.fullName
                                                            }
                                                        </Link>
                                                        {professional.businessName && (
                                                            <p className="truncate text-xs text-zinc-500">
                                                                {
                                                                    professional.businessName
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-zinc-700">
                                                <ServicesSummary
                                                    slugs={
                                                        professional.categories
                                                    }
                                                />
                                            </td>
                                            <td className="px-5 py-3.5 text-zinc-700">
                                                {professional.commune},{' '}
                                                {professional.city}
                                            </td>
                                            <td className="px-5 py-3.5 text-zinc-700 tabular-nums">
                                                +243 {professional.phone}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {professional.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                                        <CircleCheck
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        {t('Verified')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                                                            <Clock
                                                                className="size-3.5"
                                                                aria-hidden="true"
                                                            />
                                                            {t('Pending')}
                                                        </span>
                                                        <Link
                                                            href={applications({
                                                                query: {
                                                                    listing: `professional-${professional.id}`,
                                                                },
                                                            })}
                                                            className="cursor-pointer text-xs font-medium text-primary underline-offset-2 hover:underline"
                                                        >
                                                            {t('Review')}
                                                        </Link>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-zinc-500 tabular-nums">
                                                {professional.createdAt}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {professionals.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-sm">
                                <span className="text-zinc-500 tabular-nums">
                                    {professionals.from}–{professionals.to}{' '}
                                    {t('of')} {professionals.total}
                                </span>
                                <div className="flex gap-2">
                                    <PageLink
                                        href={professionals.prev_page_url}
                                        label={t('Previous')}
                                    />
                                    <PageLink
                                        href={professionals.next_page_url}
                                        label={t('Next')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function ServicesSummary({ slugs }: { slugs: string[] }) {
    const { categoryName } = useCategories();
    const names = slugs.map(categoryName);
    const visibleNames = names.slice(0, 2);
    const hiddenCount = names.length - visibleNames.length;

    return (
        <span title={names.join(', ')} className="block max-w-xs">
            {visibleNames.join(', ')}
            {hiddenCount > 0 && (
                <span className="text-zinc-500">
                    {' '}
                    +{hiddenCount} {t('more')}
                </span>
            )}
        </span>
    );
}

function PageLink({ href, label }: { href: string | null; label: string }) {
    const className =
        'inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium';

    if (!href) {
        return (
            <span
                aria-disabled="true"
                className={`${className} cursor-not-allowed text-zinc-400`}
            >
                {label}
            </span>
        );
    }

    return (
        <Link
            href={href}
            preserveScroll
            className={`${className} text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900`}
        >
            {label}
        </Link>
    );
}

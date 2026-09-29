import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Inbox, MapPin } from 'lucide-react';
import PageHeader from '@/components/workspace/page-header';
import { formatMoney } from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { quoteStatusLabels, timingLabels } from '@/lib/quote-labels';
import type { QuoteSummary } from '@/lib/quote-labels';
import { show as showQuote } from '@/routes/dashboard/quotes';
import { t } from '@/lib/i18n';

export default function QuotesIndex({ quotes }: { quotes: QuoteSummary[] }) {
    return (
        <>
            <Head title={t('Quote requests')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Quote requests')}
                    description={t(
                        "Jobs our team matched you with. Send your price, or decline if you can't take the job.",
                    )}
                />

                {quotes.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <Inbox
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {t('No quote requests yet')}
                        </p>
                        <p className="text-sm text-zinc-500">
                            {t(
                                "When a client needs your services, it will appear here and we'll email you.",
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        {quotes.map((quote) => {
                            const isNew = quote.status === 'invited';

                            return (
                                <li key={quote.id}>
                                    <Link
                                        href={showQuote(quote.id)}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-zinc-50"
                                    >
                                        <span
                                            className={cn(
                                                'size-2 shrink-0 rounded-full',
                                                isNew
                                                    ? 'bg-primary'
                                                    : 'bg-transparent',
                                            )}
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <span
                                                    className={cn(
                                                        'truncate text-sm text-zinc-900',
                                                        isNew &&
                                                            'font-semibold',
                                                    )}
                                                >
                                                    {quote.category} ·{' '}
                                                    {t(
                                                        timingLabels[
                                                            quote.timing
                                                        ],
                                                    ) ?? quote.timing}
                                                </span>
                                                <span className="shrink-0 text-xs text-zinc-500">
                                                    {quote.invitedAt}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-sm text-zinc-500">
                                                {quote.excerpt}
                                            </p>
                                            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                    {quote.location}
                                                </span>
                                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700">
                                                    {t(
                                                        quoteStatusLabels[
                                                            quote.status
                                                        ],
                                                    )}
                                                </span>
                                                {quote.amount && (
                                                    <span className="font-medium text-zinc-900 tabular-nums">
                                                        {formatMoney(
                                                            quote.amount,
                                                            quote.currency,
                                                        )}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <ChevronRight
                                            className="size-4 shrink-0 text-zinc-400"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}

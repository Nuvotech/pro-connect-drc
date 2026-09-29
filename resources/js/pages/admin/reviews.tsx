import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Star } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';
import {
    approve as approveReview,
    destroy as destroyReview,
    index as reviewsIndex,
} from '@/routes/admin/reviews';
import type { Paginated } from '@/types';
import { t } from '@/lib/i18n';

type ReviewTab = 'pending' | 'published';

type AdminReview = {
    id: number;
    rating: number;
    comment: string | null;
    reply: string | null;
    customer: string;
    listing: string;
    listingType: 'Professional' | 'Fleet';
    job: string | null;
    submittedAt: string | null;
};

const tabs: { value: ReviewTab; label: string }[] = [
    { value: 'pending', label: 'Waiting' },
    { value: 'published', label: 'Published' },
];

export default function AdminReviews({
    tab,
    reviews,
    counts,
}: {
    tab: ReviewTab;
    reviews: Paginated<AdminReview>;
    counts: Record<ReviewTab, number>;
}) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    function decide(review: AdminReview, decision: 'approve' | 'remove') {
        const options = {
            preserveScroll: true,
            onStart: () => setProcessingId(review.id),
            onFinish: () => setProcessingId(null),
        };

        if (decision === 'approve') {
            router.post(approveReview.url(review.id), {}, options);
        } else {
            router.delete(destroyReview.url(review.id), options);
        }
    }

    return (
        <>
            <Head title={t('Reviews & ratings')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Reviews & ratings')}
                    description={t(
                        'Customer reviews appear on listings only after you approve them.',
                    )}
                />

                <div className="flex flex-col gap-4">
                    <nav
                        aria-label={t('Review status')}
                        className="-mb-px flex gap-6 border-b border-zinc-200"
                    >
                        {tabs.map((item) => (
                            <Link
                                key={item.value}
                                href={reviewsIndex({
                                    query: { tab: item.value },
                                })}
                                preserveScroll
                                aria-current={
                                    tab === item.value ? 'page' : undefined
                                }
                                className={cn(
                                    'flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                    tab === item.value
                                        ? 'border-primary font-medium text-zinc-900'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-900',
                                )}
                            >
                                {t(item.label)}
                                <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums">
                                    {counts[item.value]}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    {reviews.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                            <Inbox
                                className="size-6 text-zinc-400"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-zinc-900">
                                {tab === 'pending'
                                    ? t('No reviews waiting')
                                    : t('No published reviews yet')}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {t(
                                    'New reviews from customers will appear here.',
                                )}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                            {reviews.data.map((review) => (
                                <li
                                    key={review.id}
                                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Rating value={review.rating} />
                                            <span className="text-sm font-medium text-zinc-900">
                                                {review.listing}
                                            </span>
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                                                {review.listingType}
                                            </span>
                                        </div>
                                        {review.comment ? (
                                            <p className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                                                “{review.comment}”
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-sm text-zinc-400 italic">
                                                {t('No comment')}
                                            </p>
                                        )}
                                        {review.reply && (
                                            <p className="mt-2 border-l-2 border-zinc-200 pl-3 text-sm text-zinc-500">
                                                {t('Reply:')} {review.reply}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-zinc-500">
                                            {review.customer}
                                            {review.job && ` · ${review.job}`}
                                            {review.submittedAt &&
                                                ` · ${review.submittedAt}`}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                decide(review, 'remove')
                                            }
                                            disabled={
                                                processingId === review.id
                                            }
                                            className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 disabled:opacity-60"
                                        >
                                            {t('Remove')}
                                        </button>
                                        {tab === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    decide(review, 'approve')
                                                }
                                                disabled={
                                                    processingId === review.id
                                                }
                                                className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                                            >
                                                {t('Approve')}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {reviews.last_page > 1 && (
                        <div className="flex items-center justify-between text-sm text-zinc-500">
                            <span>
                                {reviews.from}–{reviews.to} {t('of')}{' '}
                                {reviews.total}
                            </span>
                            <div className="flex gap-2">
                                {reviews.prev_page_url && (
                                    <Link
                                        href={reviews.prev_page_url}
                                        preserveScroll
                                        className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-zinc-700 hover:bg-zinc-50"
                                    >
                                        {t('Previous')}
                                    </Link>
                                )}
                                {reviews.next_page_url && (
                                    <Link
                                        href={reviews.next_page_url}
                                        preserveScroll
                                        className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-zinc-700 hover:bg-zinc-50"
                                    >
                                        {t('Next')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function Rating({ value }: { value: number }) {
    return (
        <span
            className="flex items-center gap-0.5"
            aria-label={t(':value out of 5 stars', { value })}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    aria-hidden="true"
                    className={cn(
                        'size-4',
                        star <= value
                            ? 'fill-zinc-900 text-zinc-900'
                            : 'text-zinc-300',
                    )}
                />
            ))}
        </span>
    );
}

import { Form, Head } from '@inertiajs/react';
import { MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import ProReviewController from '@/actions/App/Http/Controllers/Pro/ReviewController';
import { inputClassName } from '@/components/workspace/form-fields';
import PageHeader from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

type ProReview = {
    id: number;
    rating: number;
    comment: string | null;
    reply: string | null;
    customer: string;
    listing: 'Services' | 'Fleet';
    publishedAt: string | null;
};

export default function ProReviews({
    reviews,
    averageRating,
}: {
    reviews: ProReview[];
    averageRating: number | null;
}) {
    return (
        <>
            <Head title={t('Reviews')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Reviews')}
                    description={
                        averageRating === null
                            ? t(
                                  'Reviews from your clients appear here once our team has checked them.',
                              )
                            : t(
                                  reviews.length === 1
                                      ? ':rating out of 5 from 1 review. You can reply publicly to each one.'
                                      : ':rating out of 5 from :count reviews. You can reply publicly to each one.',
                                  {
                                      rating: averageRating,
                                      count: reviews.length,
                                  },
                              )
                    }
                />

                {reviews.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <MessageSquare
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {t('No reviews yet')}
                        </p>
                        <p className="max-w-sm text-sm text-zinc-500">
                            {t(
                                'When you finish a job, mark it done and send your client the review link.',
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                        {reviews.map((review) => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

function ReviewItem({ review }: { review: ProReview }) {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <li className="p-5">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className="flex items-center gap-0.5"
                    aria-label={t(':rating out of 5 stars', {
                        rating: review.rating,
                    })}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            aria-hidden="true"
                            className={cn(
                                'size-4',
                                star <= review.rating
                                    ? 'fill-zinc-900 text-zinc-900'
                                    : 'text-zinc-300',
                            )}
                        />
                    ))}
                </span>
                <span className="text-sm font-medium text-zinc-900">
                    {review.customer}
                </span>
                <span className="text-xs text-zinc-500">
                    {review.listing} · {review.publishedAt}
                </span>
            </div>
            {review.comment && (
                <p className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                    {review.comment}
                </p>
            )}

            {isReplying ? (
                <Form
                    {...ProReviewController.reply.form(review.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setIsReplying(false)}
                    className="mt-3 flex flex-col gap-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <label
                                htmlFor={`reply-${review.id}`}
                                className="sr-only"
                            >
                                {t('Your public reply')}
                            </label>
                            <textarea
                                id={`reply-${review.id}`}
                                name="reply"
                                rows={3}
                                maxLength={1000}
                                defaultValue={review.reply ?? ''}
                                placeholder={t(
                                    'Thank the client, or respond to their feedback…',
                                )}
                                aria-invalid={Boolean(errors.reply)}
                                className={cn(
                                    inputClassName,
                                    'h-auto resize-none py-2.5',
                                )}
                            />
                            {errors.reply && (
                                <p className="text-sm text-red-600">
                                    {errors.reply}
                                </p>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsReplying(false)}
                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                                >
                                    {processing
                                        ? t('Posting…')
                                        : t('Post reply')}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            ) : (
                <>
                    {review.reply && (
                        <p className="mt-3 border-l-2 border-zinc-200 pl-3 text-sm text-zinc-600">
                            <span className="font-medium text-zinc-900">
                                {t('Your reply:')}
                            </span>{' '}
                            {review.reply}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsReplying(true)}
                        className="mt-3 cursor-pointer text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                        {review.reply ? t('Edit reply') : t('Reply publicly')}
                    </button>
                </>
            )}
        </li>
    );
}

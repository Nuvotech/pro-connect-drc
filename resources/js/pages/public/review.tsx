import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { register as registerAccount } from '@/routes/account';
import { t } from '@/lib/i18n';

type ReviewJob = {
    proName: string;
    what: string;
    reference: string | null;
    customerName: string;
};

type ExistingReview = {
    rating: number;
    comment: string | null;
    isPublished: boolean;
};

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const commentMaxLength = 1000;

export default function Review({
    job,
    review,
    submitUrl,
    canCreateAccount,
}: {
    job: ReviewJob;
    review: ExistingReview | null;
    submitUrl: string;
    canCreateAccount: boolean;
}) {
    const form = useForm({ rating: 0, comment: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (form.data.rating === 0) {
            form.setError('rating', 'Choose a rating from 1 to 5 stars.');

            return;
        }

        form.post(submitUrl, { preserveScroll: true });
    }

    if (review) {
        return (
            <>
                <Head title={t('Thank you')} />
                <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center shadow-sm">
                    <MaterialSymbol
                        name="check_circle"
                        filled
                        className="text-[56px] text-primary"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-headline-md text-on-surface">
                            {t('Thank you!')}
                        </h1>
                        <Stars rating={review.rating} />
                        <p className="text-body-md text-on-surface-variant">
                            {review.isPublished
                                ? t(
                                      'Your review of :proName is live on their profile.',
                                      { proName: job.proName },
                                  )
                                : t(
                                      'Your review of :proName will appear once our team has checked it.',
                                      { proName: job.proName },
                                  )}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row-reverse">
                        <Link
                            href={home()}
                            className="flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-label-md text-on-primary transition-opacity hover:opacity-90"
                        >
                            {t('Back to home')}
                        </Link>
                        {canCreateAccount && (
                            <Link
                                href={registerAccount()}
                                className="flex h-11 items-center justify-center rounded-lg px-5 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                            >
                                {t('Create an account to track your requests')}
                            </Link>
                        )}
                    </div>
                </div>
            </>
        );
    }

    const hoverRating = form.data.rating;

    return (
        <>
            <Head title={`Review ${job.proName}`} />

            <form
                onSubmit={submit}
                noValidate
                className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8"
            >
                <div className="flex flex-col gap-1 text-center">
                    <p className="text-label-sm text-on-surface-variant">
                        {job.what}
                        {job.reference && ` · ${job.reference}`}
                    </p>
                    <h1 className="text-headline-md text-on-surface">
                        {t('How did')} {job.proName} {t('do?')}
                    </h1>
                </div>

                <fieldset className="flex flex-col items-center gap-2">
                    <legend className="sr-only">{t('Your rating')}</legend>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <label
                                key={value}
                                className="flex size-12 cursor-pointer items-center justify-center rounded-full transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary hover:bg-surface-container-low"
                            >
                                <input
                                    type="radio"
                                    name="rating"
                                    value={value}
                                    checked={form.data.rating === value}
                                    onChange={() => {
                                        form.setData('rating', value);
                                        form.clearErrors('rating');
                                    }}
                                    className="sr-only"
                                />
                                <span className="sr-only">
                                    {value}{' '}
                                    {value === 1 ? t('star') : t('stars')},{' '}
                                    {t(ratingLabels[value])}
                                </span>
                                <MaterialSymbol
                                    name="star"
                                    filled={value <= hoverRating}
                                    className={cn(
                                        'text-[40px] transition-colors',
                                        value <= hoverRating
                                            ? 'text-rating'
                                            : 'text-outline-variant',
                                    )}
                                />
                            </label>
                        ))}
                    </div>
                    <p
                        aria-live="polite"
                        className="h-5 text-label-md text-on-surface"
                    >
                        {t(ratingLabels[form.data.rating])}
                    </p>
                    <FieldError message={form.errors.rating} />
                </fieldset>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="review-comment"
                        className="text-label-md text-on-surface"
                    >
                        {t('Tell others about it')}{' '}
                        <span className="font-normal text-on-surface-variant">
                            {t('(optional)')}
                        </span>
                    </label>
                    <textarea
                        id="review-comment"
                        rows={4}
                        maxLength={commentMaxLength}
                        value={form.data.comment}
                        onChange={(event) =>
                            form.setData('comment', event.target.value)
                        }
                        aria-invalid={Boolean(form.errors.comment)}
                        placeholder={t(
                            'Was the work good? On time? Fair price?',
                        )}
                        className={cn(
                            inputClassName,
                            'resize-none px-3 py-2.5',
                            form.errors.comment && invalidClassName,
                        )}
                    />
                    <FieldError message={form.errors.comment} />
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {form.processing ? t('Sending…') : t('Send review')}
                </button>

                <p className="text-center text-label-sm text-on-surface-variant">
                    {t('Reviews are checked by our team before they appear.')}
                </p>
            </form>
        </>
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <p
            className="flex gap-0.5"
            aria-label={t(':rating out of 5 stars', { rating })}
        >
            {[1, 2, 3, 4, 5].map((value) => (
                <MaterialSymbol
                    key={value}
                    name="star"
                    filled={value <= rating}
                    className={cn(
                        'text-[24px]',
                        value <= rating
                            ? 'text-rating'
                            : 'text-outline-variant',
                    )}
                />
            ))}
        </p>
    );
}

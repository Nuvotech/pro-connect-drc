import { CircleCheck, Clock, MessageSquareWarning } from 'lucide-react';
import ResubmitDialog from '@/components/workspace/resubmit-dialog';
import type { ReviewSummary } from '@/types';
import { t } from '@/lib/i18n';

/**
 * Where the pro's listing is in the admin review, with the admin's message
 * and a way to send it back for review once they've made changes.
 */
export default function ReviewBanner({
    review,
    resubmitHref,
}: {
    review: ReviewSummary;
    resubmitHref: string;
}) {
    if (review.isVerified) {
        return (
            <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4"
            >
                <CircleCheck
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                />
                <div>
                    <p className="text-sm font-medium text-zinc-900">
                        {t('Verified')}
                    </p>
                    <p className="text-sm text-zinc-500">
                        {t('Your listing has been checked by our team.')}
                    </p>
                </div>
            </div>
        );
    }

    if (review.canResubmit) {
        const isDeclined = review.reviewStatus === 'declined';

        return (
            <div
                role="status"
                className="flex flex-col gap-4 rounded-xl border border-zinc-900 bg-white p-4 sm:flex-row sm:items-start"
            >
                <MessageSquareWarning
                    className="mt-0.5 size-5 shrink-0 text-zinc-900"
                    aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900">
                        {isDeclined
                            ? t('Your listing was not approved')
                            : t(
                                  'Changes needed before your listing can be verified',
                              )}
                    </p>
                    {review.adminMessage && (
                        <blockquote className="mt-2 border-l-2 border-zinc-200 pl-3 text-sm whitespace-pre-line text-zinc-700">
                            {review.adminMessage}
                        </blockquote>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                        {review.decidedAt &&
                            t('Our team, :decidedAt. ', {
                                decidedAt: review.decidedAt,
                            })}
                        {t('Update your listing, then resubmit it for review.')}
                    </p>
                </div>
                <ResubmitDialog
                    resubmitHref={resubmitHref}
                    adminMessage={review.adminMessage}
                />
            </div>
        );
    }

    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
            <Clock
                className="mt-0.5 size-5 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <div>
                <p className="text-sm font-medium text-zinc-900">
                    {review.reviewStatus === 'resubmitted'
                        ? t('Resubmitted — waiting for review')
                        : t('Waiting for review')}
                </p>
                <p className="text-sm text-zinc-500">
                    {review.submittedAt
                        ? t('Sent to our team on :submittedAt. ', {
                              submittedAt: review.submittedAt,
                          })
                        : ''}
                    {t('You can keep improving your listing while you wait.')}
                </p>
            </div>
        </div>
    );
}

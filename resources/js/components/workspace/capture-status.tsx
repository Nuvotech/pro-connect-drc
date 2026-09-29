import { CircleCheck, Clock, Lock, MessageSquareWarning } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { ReviewSummary } from '@/types';

/**
 * Where a capture stands with our team, and whether it can still be
 * edited: while waiting it can change, once verified it is locked.
 */
export default function CaptureStatus({
    review,
    canEdit,
}: {
    review: ReviewSummary;
    canEdit: boolean;
}) {
    if (!canEdit) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <CircleCheck
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                />
                <div>
                    <p className="font-medium text-zinc-900">
                        {t('Verified by our team')}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-zinc-600">
                        <Lock className="size-3.5" aria-hidden="true" />
                        {t('This capture is now read-only.')}
                    </p>
                </div>
            </div>
        );
    }

    const isSentBack =
        review.reviewStatus === 'changes_requested' ||
        review.reviewStatus === 'declined';

    if (isSentBack) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                <MessageSquareWarning
                    className="mt-0.5 size-4 shrink-0 text-amber-700"
                    aria-hidden="true"
                />
                <div>
                    <p className="font-medium text-zinc-900">
                        {review.reviewStatus === 'declined'
                            ? t('Our team could not approve this capture')
                            : t('Our team asked for changes')}
                    </p>
                    {review.adminMessage && (
                        <p className="mt-1 whitespace-pre-line text-zinc-700">
                            “{review.adminMessage}”
                        </p>
                    )}
                    <p className="mt-1 text-zinc-600">
                        {t(
                            'Make the corrections below and save. It goes back to our team automatically.',
                        )}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
            <Clock
                className="mt-0.5 size-4 shrink-0 text-zinc-500"
                aria-hidden="true"
            />
            <div>
                <p className="font-medium text-zinc-900">
                    {t('Waiting for review')}
                </p>
                <p className="mt-0.5 text-zinc-600">
                    {t('You can still correct it until our team approves it.')}
                </p>
            </div>
        </div>
    );
}

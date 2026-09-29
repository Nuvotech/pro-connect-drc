import { CircleCheck, Clock } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Whether a listing has been verified by an admin, as an icon and label.
 */
export default function ListingStatus({
    isVerified,
    verifiedAt,
}: {
    isVerified: boolean;
    verifiedAt?: string | null;
}) {
    if (isVerified) {
        return (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <CircleCheck className="size-4" aria-hidden="true" />
                {t('Verified')}
                {verifiedAt && ` · ${verifiedAt}`}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
            <Clock className="size-4" aria-hidden="true" />
            {t('Pending verification')}
        </span>
    );
}

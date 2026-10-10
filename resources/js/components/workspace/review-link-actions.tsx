import LinkShareActions from '@/components/workspace/link-share-actions';
import { t } from '@/lib/i18n';

/**
 * Lets an admin send a customer their private review link: open WhatsApp
 * with a ready-made message, or copy the link.
 */
export default function ReviewLinkActions({
    reviewUrl,
    customerPhone,
    customerName,
    proName,
}: {
    reviewUrl: string;
    customerPhone: string;
    customerName: string;
    proName: string;
}) {
    const firstName = customerName.split(' ')[0];

    return (
        <LinkShareActions
            url={reviewUrl}
            phone={customerPhone}
            message={t(
                'Hello :firstName, thank you for using ProConnect! How did :proName do? Rate them here, it takes less than a minute: :reviewUrl',
                { firstName, proName, reviewUrl },
            )}
            copyLabel={t('Copy review link')}
        />
    );
}

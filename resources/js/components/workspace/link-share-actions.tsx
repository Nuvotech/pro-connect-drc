import { Check, Copy, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { t } from '@/lib/i18n';

/**
 * Lets an admin send someone a private link by hand: open WhatsApp with a
 * ready-made message, or copy the link.
 */
export default function LinkShareActions({
    url,
    phone,
    message,
    copyLabel,
}: {
    url: string;
    phone: string;
    /** The WhatsApp message, with the link already in it. */
    message: string;
    copyLabel: string;
}) {
    const [isCopied, setIsCopied] = useState(false);
    const whatsAppUrl = `https://wa.me/243${phone.replace(/\D/g, '').replace(/^243/, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}`;

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 2000);
        } catch {
            window.prompt(copyLabel, url);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
            >
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('Send on WhatsApp')}
            </a>
            <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
            >
                {isCopied ? (
                    <Check className="size-4" aria-hidden="true" />
                ) : (
                    <Copy className="size-4" aria-hidden="true" />
                )}
                {isCopied ? t('Copied') : copyLabel}
            </button>
        </div>
    );
}

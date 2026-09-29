import { useState } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { t } from '@/lib/i18n';
import { becomeAPro } from '@/routes';

/**
 * A small prompt to invite a local pro to join, with a button that copies
 * the "Become a pro" link to share.
 */
export default function InviteProLink() {
    const [isCopied, setIsCopied] = useState(false);
    const inviteUrl = `${window.location.origin}${becomeAPro.url()}`;

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 2500);
        } catch {
            window.prompt(t('Copy this link'), inviteUrl);
        }
    }

    return (
        <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-label-sm text-on-surface-variant">
            {t(
                'Know a service provider or professional near you? Share this link so they can join ProConnect.',
            )}
            <button
                type="button"
                onClick={copyLink}
                className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary underline-offset-2 hover:underline"
            >
                <MaterialSymbol
                    name={isCopied ? 'check' : 'content_copy'}
                    className="text-[16px]"
                />
                {isCopied ? t('Link copied') : t('Copy invite link')}
            </button>
            <span aria-live="polite" className="sr-only">
                {isCopied ? t('Link copied') : ''}
            </span>
        </p>
    );
}

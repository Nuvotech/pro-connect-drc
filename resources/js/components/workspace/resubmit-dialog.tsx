import * as DialogPrimitive from '@radix-ui/react-dialog';
import { router } from '@inertiajs/react';
import { LoaderCircle, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { t } from '@/lib/i18n';

/**
 * Confirms that the pro has made the requested changes before their
 * listing goes back to the review queue.
 */
export default function ResubmitDialog({
    resubmitHref,
    adminMessage,
}: {
    resubmitHref: string;
    adminMessage: string | null;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resubmit() {
        router.post(
            resubmitHref,
            {},
            {
                preserveScroll: true,
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onSuccess: () => setIsOpen(false),
            },
        );
    }

    return (
        <DialogPrimitive.Root
            open={isOpen}
            onOpenChange={(open) => !isSubmitting && setIsOpen(open)}
        >
            <DialogPrimitive.Trigger className="inline-flex h-9 shrink-0 cursor-pointer items-center self-start rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container">
                {t('Resubmit for review')}
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:items-center">
                    <DialogPrimitive.Content className="w-full max-w-md rounded-2xl bg-white shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95">
                        <div className="flex items-start gap-4 p-6">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <RotateCcw
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="min-w-0 flex-1">
                                <DialogPrimitive.Title className="text-base font-semibold text-zinc-900">
                                    {t('Resubmit for review?')}
                                </DialogPrimitive.Title>
                                <DialogPrimitive.Description className="mt-1 text-sm leading-relaxed text-zinc-600">
                                    {t(
                                        'Have you made the requested changes? Your listing will go back to our team for review.',
                                    )}
                                </DialogPrimitive.Description>
                                {adminMessage && (
                                    <div className="mt-4 rounded-lg bg-zinc-50 p-3">
                                        <p className="text-xs font-medium text-zinc-500">
                                            {t('What our team asked for')}
                                        </p>
                                        <p className="mt-1 text-sm whitespace-pre-line text-zinc-700">
                                            {adminMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <DialogPrimitive.Close
                                aria-label={t('Close')}
                                disabled={isSubmitting}
                                className="-mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"
                            >
                                <X className="size-4" aria-hidden="true" />
                            </DialogPrimitive.Close>
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-6 py-4 sm:flex-row sm:justify-end">
                            <DialogPrimitive.Close
                                disabled={isSubmitting}
                                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t('Not yet')}
                            </DialogPrimitive.Close>
                            <button
                                type="button"
                                onClick={resubmit}
                                disabled={isSubmitting}
                                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting && (
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {isSubmitting
                                    ? t('Resubmitting…')
                                    : t('Yes, resubmit')}
                            </button>
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

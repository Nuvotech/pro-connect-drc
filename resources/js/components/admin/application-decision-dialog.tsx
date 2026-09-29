import { router } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CircleCheck, Circle, Eye, Lock, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
    decisionOptions,
    reviewQuickTags,
    reviewReasons,
} from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { decision as decisionRoute } from '@/routes/admin/applications';
import type { ReviewApplication, ReviewDecision } from '@/types';
import { t } from '@/lib/i18n';

type ApplicationDecisionDialogProps = {
    application: ReviewApplication;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    sessionKey: number;
    initialDecision: ReviewDecision;
};

const fieldClassName =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none';

function messageTemplate(
    decision: ReviewDecision,
    application: ReviewApplication,
): string {
    const greeting = `Hello ${application.contactName},`;

    if (decision === 'approve') {
        return t(
            ':greeting your listing is verified and now visible to clients on ProConnect. Welcome aboard!',
            { greeting },
        );
    }

    const missing = application.checklist
        .filter((item) => !item.isDone)
        .map((item) => `- ${item.label}`)
        .join('\n');

    if (decision === 'request_changes') {
        return t(
            ':greeting thanks for your application. Before we can verify your listing, please:\n:missing',
            { greeting, missing: missing || '- ' },
        );
    }

    return t(
        ':greeting after reviewing your application we are unable to approve it at this time. Reason: ',
        { greeting },
    );
}

export default function ApplicationDecisionDialog({
    application,
    isOpen,
    onOpenChange,
    sessionKey,
    initialDecision,
}: ApplicationDecisionDialogProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:p-6">
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95 sm:h-auto sm:max-h-[92vh] sm:rounded-2xl"
                    >
                        <DecisionForm
                            key={sessionKey}
                            application={application}
                            initialDecision={initialDecision}
                            onDone={() => onOpenChange(false)}
                        />
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

function DecisionForm({
    application,
    initialDecision,
    onDone,
}: {
    application: ReviewApplication;
    initialDecision: ReviewDecision;
    onDone: () => void;
}) {
    const [decision, setDecision] = useState(initialDecision);
    const [message, setMessage] = useState(() =>
        messageTemplate(initialDecision, application),
    );
    const [internalNote, setInternalNote] = useState('');
    const [shouldNotify, setShouldNotify] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const missingItems = application.checklist.filter((item) => !item.isDone);

    function changeDecision(nextDecision: ReviewDecision) {
        setDecision(nextDecision);
        setMessage(messageTemplate(nextDecision, application));
        setErrors({});
    }

    function addReason(reason: string) {
        setMessage((previous) =>
            `${previous.trimEnd()}\n${reason}`.trimStart(),
        );
        setErrors({});
    }

    function addQuickTag(tag: string) {
        setInternalNote((previous) =>
            previous.trim() ? `${previous.trim()} · ${tag}` : tag,
        );
    }

    function submitDecision(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.post(
            decisionRoute.url({ type: application.type, id: application.id }),
            {
                decision,
                message: message.trim() || null,
                internal_note: internalNote.trim() || null,
                notify: shouldNotify,
            },
            {
                preserveScroll: true,
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onError: (serverErrors) => setErrors(serverErrors),
                onSuccess: onDone,
            },
        );
    }

    return (
        <form
            onSubmit={submitDecision}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
        >
            <div className="flex shrink-0 items-start justify-between gap-6 border-b border-zinc-200 px-6 py-5">
                <div className="min-w-0">
                    <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-zinc-900">
                        {t('Review decision')}
                    </DialogPrimitive.Title>
                    <p className="mt-0.5 truncate text-sm text-zinc-500">
                        {application.name} ·{' '}
                        {application.type === 'vehicle_provider'
                            ? t('Vehicle rental')
                            : t('Services')}
                        {application.submittedAt &&
                            ` · Submitted ${application.submittedAt}`}
                    </p>
                </div>
                <DialogPrimitive.Close
                    aria-label={t('Close dialog')}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700"
                >
                    <X className="size-4" />
                </DialogPrimitive.Close>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
                <div className="flex flex-col gap-4 border-zinc-200 bg-zinc-50 p-6 lg:overflow-y-auto lg:border-r">
                    <section className="rounded-xl border border-zinc-200 bg-white p-4">
                        <h4 className="text-sm font-semibold text-zinc-900">
                            {t("Why it isn't verified yet")}
                        </h4>
                        {missingItems.length === 0 ? (
                            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                                <CircleCheck
                                    className="size-4 text-primary"
                                    aria-hidden="true"
                                />
                                {t('Everything required is in place.')}
                            </p>
                        ) : (
                            <ul className="mt-3 flex flex-col gap-2">
                                {missingItems.map((item) => (
                                    <li
                                        key={item.key}
                                        className="flex items-center gap-2 text-sm text-zinc-900"
                                    >
                                        <Circle
                                            className="size-4 text-zinc-300"
                                            aria-hidden="true"
                                        />
                                        {t(item.label)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-xl border border-zinc-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold text-zinc-900">
                            {t('Documents')}
                        </h4>
                        <ul className="flex flex-col divide-y divide-zinc-100">
                            {application.documents.map((document) => (
                                <li
                                    key={document.key}
                                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                                >
                                    <span className="text-sm text-zinc-900">
                                        {t(document.label)}
                                    </span>
                                    {document.url ? (
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-2 hover:underline"
                                        >
                                            <Eye
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            {t('View')}
                                        </a>
                                    ) : (
                                        <span className="text-xs text-zinc-500">
                                            {t('Not provided')}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-sm">
                            <div>
                                <dt className="text-xs text-zinc-500">
                                    {t('RCCM')}
                                </dt>
                                <dd className="font-mono text-[13px] text-zinc-900">
                                    {application.registryNumber ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-zinc-500">
                                    {t('Tax ID')}
                                </dt>
                                <dd className="font-mono text-[13px] text-zinc-900">
                                    {application.taxId ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="flex flex-col gap-6 p-6 lg:overflow-y-auto">
                    <fieldset>
                        <legend className="mb-3 text-sm font-medium text-zinc-900">
                            {t('Decision')}
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {decisionOptions.map((option) => {
                                const isSelected = decision === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className={cn(
                                            'flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30',
                                            isSelected
                                                ? 'border-primary ring-1 ring-primary'
                                                : 'border-zinc-200 hover:border-zinc-300',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="decision"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={() =>
                                                changeDecision(option.value)
                                            }
                                            className="sr-only"
                                        />
                                        <span className="text-sm font-medium text-zinc-900">
                                            {t(option.label)}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {t(option.description)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                            <label
                                htmlFor="decision-message"
                                className="text-sm font-medium text-zinc-900"
                            >
                                {t('Message to the pro')}
                            </label>
                            <span className="text-xs text-zinc-500">
                                {decision === 'approve'
                                    ? t('Optional')
                                    : t('Required')}
                            </span>
                        </div>
                        <textarea
                            id="decision-message"
                            rows={6}
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                                setErrors({});
                            }}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={
                                errors.message
                                    ? 'decision-message-error'
                                    : undefined
                            }
                            className={cn(
                                fieldClassName,
                                errors.message && 'border-zinc-900',
                            )}
                        />
                        {errors.message && (
                            <p
                                id="decision-message-error"
                                className="text-xs font-medium text-zinc-900"
                            >
                                {t(errors.message)}
                            </p>
                        )}
                        {decision !== 'approve' && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {reviewReasons.map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => addReason(reason)}
                                        className="cursor-pointer rounded-full border border-zinc-200 px-2.5 py-1 text-left text-xs text-zinc-600 transition-colors duration-200 hover:border-zinc-300 hover:text-zinc-900"
                                    >
                                        + {reason}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                            <label
                                htmlFor="decision-internal-note"
                                className="text-sm font-medium text-zinc-900"
                            >
                                {t('Internal note')}
                            </label>
                            <span className="text-xs text-zinc-500">
                                {t('Only visible to admins')}
                            </span>
                        </div>
                        <textarea
                            id="decision-internal-note"
                            rows={2}
                            value={internalNote}
                            onChange={(event) =>
                                setInternalNote(event.target.value)
                            }
                            placeholder={t(
                                'e.g. Registry cross-checked, called the pro.',
                            )}
                            className={fieldClassName}
                        />
                        <div className="flex flex-wrap gap-1.5">
                            {reviewQuickTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => addQuickTag(tag)}
                                    className="cursor-pointer rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 transition-colors duration-200 hover:border-zinc-300 hover:text-zinc-900"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 border-t border-zinc-100 pt-5">
                        <input
                            type="checkbox"
                            checked={shouldNotify}
                            onChange={(event) =>
                                setShouldNotify(event.target.checked)
                            }
                            className="size-4 cursor-pointer rounded accent-primary"
                        />
                        <span className="text-sm text-zinc-700">
                            {t('Email the pro about this decision')}
                            {application.email && ` (${application.email})`}
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse items-stretch justify-between gap-3 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:items-center">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Lock className="size-3.5" aria-hidden="true" />
                    {t('Logged with your name and the time')}
                </span>
                <div className="flex items-center justify-end gap-2">
                    <DialogPrimitive.Close className="inline-flex h-9 cursor-pointer items-center rounded-lg px-3.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900">
                        {t('Cancel')}
                    </DialogPrimitive.Close>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? t('Saving…') : t('Confirm decision')}
                    </button>
                </div>
            </div>
        </form>
    );
}

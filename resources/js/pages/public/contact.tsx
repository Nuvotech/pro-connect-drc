import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store as storeContact } from '@/routes/contact';

type Topic = { value: string; label: string };

export default function Contact({
    topics,
    prefill,
}: {
    topics: Topic[];
    prefill: { name: string; email: string };
}) {
    const [isSent, setIsSent] = useState(false);
    const form = useForm({
        name: prefill.name,
        email: prefill.email,
        phone: '',
        topic: topics[0]?.value ?? 'general',
        message: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(storeContact.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSent(true);
                form.reset('message');
            },
        });
    }

    return (
        <>
            <Head title={t('Contact us')} />

            <div className="flex w-full flex-col gap-10 px-page py-12 md:flex-row md:gap-16 md:py-16">
                <div className="flex flex-col gap-4 md:w-80 md:shrink-0">
                    <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
                        {t('Contact us')}
                    </h1>
                    <p className="text-body-md text-on-surface-variant">
                        {t(
                            'Questions, a problem with a request, or want to work with us? Send us a message and our team will get back to you.',
                        )}
                    </p>
                    <p className="flex items-center gap-2 text-label-md text-on-surface-variant">
                        <MaterialSymbol
                            name="schedule"
                            className="text-[20px] text-primary"
                        />
                        {t('We usually reply within 1 working day.')}
                    </p>
                </div>

                <div className="w-full max-w-xl">
                    {isSent ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
                            <MaterialSymbol
                                name="check_circle"
                                filled
                                className="text-[56px] text-primary"
                            />
                            <h2 className="text-headline-md text-on-surface">
                                {t('Message sent')}
                            </h2>
                            <p className="max-w-sm text-body-md text-on-surface-variant">
                                {t(
                                    'Thank you. Our team will reply by email or phone as soon as possible.',
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsSent(false)}
                                className="h-11 cursor-pointer rounded-lg px-5 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                            >
                                {t('Send another message')}
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={submit}
                            noValidate
                            className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 sm:p-8"
                        >
                            <Field
                                id="contact-name"
                                label={t('Your name')}
                                error={form.errors.name}
                            >
                                <input
                                    id="contact-name"
                                    type="text"
                                    autoComplete="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    aria-invalid={Boolean(form.errors.name)}
                                    className={cn(
                                        inputClassName,
                                        'h-11 px-3',
                                        form.errors.name && invalidClassName,
                                    )}
                                />
                            </Field>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    id="contact-email"
                                    label={t('Email')}
                                    error={form.errors.email}
                                >
                                    <input
                                        id="contact-email"
                                        type="email"
                                        autoComplete="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            form.errors.email,
                                        )}
                                        placeholder={t('you@example.com')}
                                        className={cn(
                                            inputClassName,
                                            'h-11 px-3',
                                            form.errors.email &&
                                                invalidClassName,
                                        )}
                                    />
                                </Field>
                                <Field
                                    id="contact-phone"
                                    label={t('Phone or WhatsApp')}
                                    error={form.errors.phone}
                                >
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        autoComplete="tel"
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            form.errors.phone,
                                        )}
                                        placeholder="+243 81 234 5678"
                                        className={cn(
                                            inputClassName,
                                            'h-11 px-3',
                                            form.errors.phone &&
                                                invalidClassName,
                                        )}
                                    />
                                </Field>
                            </div>
                            <p className="-mt-2 text-label-sm text-on-surface-variant">
                                {t(
                                    'Give at least one, so we can reply to you.',
                                )}
                            </p>

                            <Field
                                id="contact-topic"
                                label={t('What is it about?')}
                                error={form.errors.topic}
                            >
                                <div className="relative flex items-center">
                                    <select
                                        id="contact-topic"
                                        value={form.data.topic}
                                        onChange={(event) =>
                                            form.setData(
                                                'topic',
                                                event.target.value,
                                            )
                                        }
                                        className={cn(
                                            selectClassName,
                                            'h-11 pr-9 pl-3',
                                        )}
                                    >
                                        {topics.map((topic) => (
                                            <option
                                                key={topic.value}
                                                value={topic.value}
                                            >
                                                {topic.label}
                                            </option>
                                        ))}
                                    </select>
                                    <MaterialSymbol
                                        name="expand_more"
                                        className="pointer-events-none absolute right-2.5 text-[20px] text-outline"
                                    />
                                </div>
                            </Field>

                            <Field
                                id="contact-message"
                                label={t('Your message')}
                                error={form.errors.message}
                            >
                                <textarea
                                    id="contact-message"
                                    rows={5}
                                    maxLength={3000}
                                    value={form.data.message}
                                    onChange={(event) =>
                                        form.setData(
                                            'message',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(form.errors.message)}
                                    className={cn(
                                        inputClassName,
                                        'resize-none px-3 py-2.5',
                                        form.errors.message && invalidClassName,
                                    )}
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-2 flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing
                                    ? t('Sending…')
                                    : t('Send message')}
                                {!form.processing && (
                                    <MaterialSymbol
                                        name="send"
                                        className="text-[18px]"
                                    />
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-label-md text-on-surface">
                {label}
            </label>
            {children}
            <FieldError message={error} />
        </div>
    );
}

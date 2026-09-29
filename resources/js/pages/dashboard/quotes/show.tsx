import { Form, Head, Link } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import QuoteController from '@/actions/App/Http/Controllers/Pro/QuoteController';
import { Field, inputClassName } from '@/components/workspace/form-fields';
import PageHeader from '@/components/workspace/page-header';
import { formatMoney } from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import {
    complete as completeQuote,
    decline as declineQuote,
    index as quotesIndex,
} from '@/routes/dashboard/quotes';
import { quoteStatusLabels, timingLabels } from '@/lib/quote-labels';
import type { QuoteSummary } from '@/lib/quote-labels';
import { t } from '@/lib/i18n';

type QuoteDetail = QuoteSummary & {
    message: string | null;
    estimatedDuration: string | null;
    description: string;
    address: string | null;
    needsSiteVisit: boolean;
    photos: string[];
    customer: {
        name: string;
        phone: string;
        email: string | null;
        channel: string;
    };
    canRespond: boolean;
    canComplete: boolean;
    completedAt: string | null;
};

const serviceTypeLabels: Record<string, string> = {
    emergency: 'Emergency repair',
    installation: 'New installation',
    renovation: 'Renovation',
    maintenance: 'Maintenance',
};

export default function ShowQuote({
    quote,
    currencies,
}: {
    quote: QuoteDetail;
    currencies: string[];
}) {
    const canDecline = ['invited', 'viewed'].includes(quote.status);

    return (
        <>
            <Head title={`${quote.category} · ${quote.reference}`} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={quote.category}
                    description={`${quote.reference} · ${t(quoteStatusLabels[quote.status])}`}
                    backHref={quotesIndex()}
                    backLabel={t('Quote requests')}
                />

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
                    <article className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white lg:col-span-3">
                        <Section title={t('The job')}>
                            <p className="text-sm text-zinc-500">
                                {t(serviceTypeLabels[quote.serviceType]) ??
                                    quote.serviceType}{' '}
                                ·{' '}
                                {t(timingLabels[quote.timing]) ?? quote.timing}{' '}
                                ·{' '}
                                {quote.needsSiteVisit
                                    ? t('Wants a site visit')
                                    : t('Happy with a remote quote')}
                            </p>
                            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-zinc-800">
                                {quote.description}
                            </p>
                            {quote.photos.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {quote.photos.map((photo, index) => (
                                        <a
                                            key={photo}
                                            href={photo}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="aspect-square overflow-hidden rounded-lg bg-zinc-100"
                                        >
                                            <img
                                                src={photo}
                                                alt={t('Job photo :index', {
                                                    index: index + 1,
                                                })}
                                                className="size-full object-cover"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </Section>
                        <Section title={t('Client')}>
                            <dl className="flex flex-col gap-2.5 text-sm text-zinc-700">
                                <Detail icon={<MapPin className="size-4" />}>
                                    {[quote.address, quote.location]
                                        .filter(Boolean)
                                        .join(', ')}
                                </Detail>
                                <Detail icon={<Phone className="size-4" />}>
                                    <a
                                        href={`tel:+243${quote.customer.phone.replace(/\D/g, '')}`}
                                        className="hover:underline"
                                    >
                                        +243 {quote.customer.phone}
                                    </a>{' '}
                                    · {quote.customer.name}
                                </Detail>
                                {quote.customer.channel === 'whatsapp' && (
                                    <Detail
                                        icon={
                                            <MessageCircle className="size-4" />
                                        }
                                    >
                                        {t('Prefers WhatsApp')}
                                    </Detail>
                                )}
                                {quote.customer.email && (
                                    <Detail icon={<Mail className="size-4" />}>
                                        {quote.customer.email}
                                    </Detail>
                                )}
                            </dl>
                        </Section>
                    </article>

                    <aside className="rounded-xl border border-zinc-200 bg-white p-6 lg:col-span-2">
                        {quote.canRespond ? (
                            <Form
                                {...QuoteController.update.form(quote.id)}
                                options={{ preserveScroll: true }}
                                className="flex flex-col gap-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div>
                                            <h2 className="text-base font-semibold text-zinc-900">
                                                {quote.status === 'quoted'
                                                    ? t('Update your quote')
                                                    : t('Send your price')}
                                            </h2>
                                            <p className="mt-0.5 text-sm text-zinc-500">
                                                {t(
                                                    'The client gets it by email with your contact details.',
                                                )}
                                            </p>
                                        </div>
                                        <Field
                                            label={t('Price')}
                                            htmlFor="amount"
                                            error={
                                                errors.amount ?? errors.currency
                                            }
                                        >
                                            <div className="flex gap-2">
                                                <select
                                                    name="currency"
                                                    aria-label={t('Currency')}
                                                    defaultValue={
                                                        quote.currency
                                                    }
                                                    className={cn(
                                                        inputClassName,
                                                        'w-24 shrink-0 cursor-pointer',
                                                    )}
                                                >
                                                    {currencies.map(
                                                        (currency) => (
                                                            <option
                                                                key={currency}
                                                                value={currency}
                                                            >
                                                                {currency}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <input
                                                    id="amount"
                                                    name="amount"
                                                    type="number"
                                                    inputMode="decimal"
                                                    min={1}
                                                    step="0.01"
                                                    defaultValue={
                                                        quote.amount ??
                                                        undefined
                                                    }
                                                    aria-invalid={Boolean(
                                                        errors.amount,
                                                    )}
                                                    className={inputClassName}
                                                />
                                            </div>
                                        </Field>
                                        <Field
                                            label={t('How long it will take')}
                                            htmlFor="estimated_duration"
                                            error={errors.estimated_duration}
                                            isOptional
                                        >
                                            <input
                                                id="estimated_duration"
                                                name="estimated_duration"
                                                defaultValue={
                                                    quote.estimatedDuration ??
                                                    undefined
                                                }
                                                placeholder={t('e.g. 1 day')}
                                                className={inputClassName}
                                            />
                                        </Field>
                                        <Field
                                            label={t('Message to the client')}
                                            htmlFor="message"
                                            error={errors.message}
                                        >
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                defaultValue={
                                                    quote.message ?? undefined
                                                }
                                                placeholder={t(
                                                    'What the price includes, materials, when you can start…',
                                                )}
                                                aria-invalid={Boolean(
                                                    errors.message,
                                                )}
                                                className={cn(
                                                    inputClassName,
                                                    'h-auto resize-none py-2.5',
                                                )}
                                            />
                                        </Field>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                                        >
                                            {processing
                                                ? t('Sending…')
                                                : quote.status === 'quoted'
                                                  ? t('Update quote')
                                                  : t('Send quote')}
                                        </button>
                                        {canDecline && (
                                            <Link
                                                href={declineQuote(quote.id)}
                                                as="button"
                                                className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                                            >
                                                {t("I can't take this job")}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </Form>
                        ) : (
                            <div>
                                <h2 className="text-base font-semibold text-zinc-900">
                                    {t(quoteStatusLabels[quote.status])}
                                </h2>
                                {quote.amount && (
                                    <p className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">
                                        {formatMoney(
                                            quote.amount,
                                            quote.currency,
                                        )}
                                    </p>
                                )}
                                {quote.message && (
                                    <p className="mt-3 text-sm whitespace-pre-line text-zinc-600">
                                        {quote.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {quote.canComplete && (
                            <div className="mt-6 border-t border-zinc-100 pt-6">
                                <h2 className="text-sm font-semibold text-zinc-900">
                                    {t('Finished the job?')}
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {t(
                                        'Mark it done once the work is finished.',
                                    )}
                                </p>
                                <Link
                                    href={completeQuote(quote.id)}
                                    as="button"
                                    preserveScroll
                                    className="mt-3 inline-flex h-10 cursor-pointer items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-50"
                                >
                                    {t('Mark job done')}
                                </Link>
                            </div>
                        )}

                        {quote.status === 'completed' && (
                            <p className="mt-6 border-t border-zinc-100 pt-6 text-sm text-zinc-500">
                                {t('Job done')}
                                {quote.completedAt &&
                                    ` on ${quote.completedAt}`}
                                {t(
                                    ". Thank you! We'll follow up with the client.",
                                )}
                            </p>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="p-6">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                {title}
            </h2>
            {children}
        </section>
    );
}

function Detail({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-zinc-400" aria-hidden="true">
                {icon}
            </span>
            <span>{children}</span>
        </div>
    );
}

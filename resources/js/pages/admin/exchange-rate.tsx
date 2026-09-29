import { Form, Head, Link } from '@inertiajs/react';
import ExchangeRateController from '@/actions/App/Http/Controllers/Admin/ExchangeRateController';
import type { ExchangeRate } from '@/types';
import { dateLocale, t } from '@/lib/i18n';

type LatestApiRate = {
    rate: number;
    updatedAt: string;
};

function formatRate(rate: number): string {
    return `${rate.toLocaleString('en-US', { maximumFractionDigits: 2 })} FC`;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString(dateLocale(), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ExchangeRatePage({
    current,
    latestApi,
}: {
    current: ExchangeRate | null;
    latestApi: LatestApiRate | null;
}) {
    const isManual = current?.source === 'manual';

    return (
        <>
            <Head title={t('Exchange rate')} />

            <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 md:px-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        {t('Exchange rate')}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {t(
                            'Visitors can view every public price in US dollars or Congolese francs using this rate. It updates automatically each day unless you set it by hand.',
                        )}
                    </p>
                </div>

                <section className="rounded-xl border border-zinc-200 bg-white p-6">
                    <p className="text-sm text-zinc-500">{t('Rate in use')}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                        {current ? `1 USD = ${formatRate(current.rate)}` : '—'}
                    </p>
                    {current && (
                        <p className="mt-2 text-sm text-zinc-500">
                            {isManual ? t('Set by an admin') : t('Automatic')} ·{' '}
                            {formatDate(current.updatedAt)}
                        </p>
                    )}
                    {isManual && latestApi && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                            <p className="text-sm text-zinc-500">
                                {t('Latest automatic rate:')}{' '}
                                <span className="font-medium text-zinc-900 tabular-nums">
                                    {formatRate(latestApi.rate)}
                                </span>{' '}
                                ({formatDate(latestApi.updatedAt)})
                            </p>
                            <Link
                                href={ExchangeRateController.destroy()}
                                as="button"
                                preserveScroll
                                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                            >
                                {t('Use automatic rate')}
                            </Link>
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-6">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {t('Set the rate by hand')}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {t(
                            'For example to match the Banque Centrale du Congo rate. It stays in use until you switch back to the automatic rate.',
                        )}
                    </p>
                    <Form
                        {...ExchangeRateController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        className="mt-4 flex flex-col gap-2"
                    >
                        {({ errors, processing }) => (
                            <>
                                <label
                                    htmlFor="rate"
                                    className="text-sm font-medium text-zinc-900"
                                >
                                    {t('Francs per US dollar')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="rate"
                                        name="rate"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min={500}
                                        max={20000}
                                        placeholder={
                                            current
                                                ? String(
                                                      Math.round(current.rate),
                                                  )
                                                : '2300'
                                        }
                                        aria-invalid={Boolean(errors.rate)}
                                        className="h-10 w-full max-w-xs rounded-lg border border-zinc-200 px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 aria-invalid:border-red-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing
                                            ? t('Saving…')
                                            : t('Save rate')}
                                    </button>
                                </div>
                                {errors.rate && (
                                    <p className="text-sm text-red-600">
                                        {errors.rate}
                                    </p>
                                )}
                            </>
                        )}
                    </Form>
                </section>
            </div>
        </>
    );
}

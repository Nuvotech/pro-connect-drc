import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import ProfessionalController from '@/actions/App/Http/Controllers/Admin/ProfessionalController';
import ProfessionalFields from '@/components/workspace/professional-fields';
import { index as professionalsIndex } from '@/routes/admin/professionals';
import { t } from '@/lib/i18n';

export default function CreateProfessional() {
    return (
        <>
            <Head title={t('Onboard professional')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <div>
                    <Link
                        href={professionalsIndex()}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        {t('Professionals')}
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        {t('Onboard a professional')}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {t(
                            'Add a service provider, technician or business directly, without a public application.',
                        )}
                    </p>
                </div>

                <Form
                    {...ProfessionalController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <ProfessionalFields
                                errors={errors}
                                showVerifiedToggle
                            />

                            <div className="flex items-center justify-end gap-2">
                                {progress && (
                                    <span className="mr-auto text-xs text-zinc-500 tabular-nums">
                                        {t('Uploading…')} {progress.percentage}%
                                    </span>
                                )}
                                <Link
                                    href={professionalsIndex()}
                                    className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    {t('Cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? t('Saving…')
                                        : t('Onboard professional')}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

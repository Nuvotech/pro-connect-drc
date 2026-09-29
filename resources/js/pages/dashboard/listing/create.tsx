import { Form, Head } from '@inertiajs/react';
import ListingController from '@/actions/App/Http/Controllers/Pro/ListingController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import ProfessionalFields from '@/components/workspace/professional-fields';
import type { ProfessionalFieldDefaults } from '@/components/workspace/professional-fields';
import { dashboard } from '@/routes';
import { t } from '@/lib/i18n';

/**
 * Pre-filled from the pro's join application when they have one.
 */
export default function CreateListing({
    defaults,
}: {
    defaults: ProfessionalFieldDefaults | null;
}) {
    return (
        <>
            <Head title={t('Set up your listing')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Set up your listing')}
                    description={t(
                        'Tell clients what you do. An admin will verify your details before your listing goes live.',
                    )}
                    backHref={dashboard()}
                    backLabel={t('Overview')}
                />

                <Form
                    {...ListingController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <ProfessionalFields
                                errors={errors}
                                defaults={defaults ?? undefined}
                            />
                            <FormActions
                                cancelHref={dashboard()}
                                submitLabel={t('Send for verification')}
                                processing={processing}
                                progress={progress?.percentage}
                            />
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

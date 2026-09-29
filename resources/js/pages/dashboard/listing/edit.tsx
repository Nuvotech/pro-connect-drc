import { Form, Head } from '@inertiajs/react';
import ListingController from '@/actions/App/Http/Controllers/Pro/ListingController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import ProfessionalFields from '@/components/workspace/professional-fields';
import { show } from '@/routes/dashboard/listing';
import { professionalDefaults } from '@/lib/workspace-defaults';
import type { ProfessionalListing } from '@/types';
import { t } from '@/lib/i18n';

export default function EditListing({
    listing,
}: {
    listing: ProfessionalListing;
}) {
    return (
        <>
            <Head title={t('Edit listing')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Edit listing')}
                    description={t(
                        'Changing your RCCM number, tax ID or ID document sends your listing back for verification.',
                    )}
                    backHref={show()}
                    backLabel={t('My listing')}
                />

                <Form
                    {...ListingController.update.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <ProfessionalFields
                                errors={errors}
                                defaults={professionalDefaults(listing)}
                            />
                            <FormActions
                                cancelHref={show()}
                                submitLabel={t('Save changes')}
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

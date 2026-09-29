import { Form, Head } from '@inertiajs/react';
import CapturedProfessionalController from '@/actions/App/Http/Controllers/Capture/CapturedProfessionalController';
import CaptureStatus from '@/components/workspace/capture-status';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import ProfessionalFields from '@/components/workspace/professional-fields';
import { t } from '@/lib/i18n';
import { professionalDefaults } from '@/lib/workspace-defaults';
import { index as capturesIndex } from '@/routes/captures';
import type { ProfessionalListing, ReviewSummary } from '@/types';

export default function CapturedProfessional({
    listing,
    review,
    canEdit,
}: {
    listing: ProfessionalListing;
    review: ReviewSummary;
    canEdit: boolean;
}) {
    const title = listing.businessName ?? listing.fullName;

    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
                <PageHeader
                    title={title}
                    description={t('Professional')}
                    backHref={capturesIndex()}
                    backLabel={t('My captures')}
                />

                <CaptureStatus review={review} canEdit={canEdit} />

                {canEdit ? (
                    <Form
                        {...CapturedProfessionalController.update.form(
                            listing.id,
                        )}
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
                                    cancelHref={capturesIndex()}
                                    submitLabel={t('Save changes')}
                                    processing={processing}
                                    progress={progress?.percentage}
                                />
                            </>
                        )}
                    </Form>
                ) : (
                    <fieldset
                        disabled
                        aria-label={t('Details (read-only)')}
                        className="flex flex-col gap-6 [&_button]:hidden"
                    >
                        <ProfessionalFields
                            errors={{}}
                            defaults={professionalDefaults(listing)}
                        />
                    </fieldset>
                )}
            </div>
        </>
    );
}

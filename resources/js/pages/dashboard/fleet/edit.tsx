import { Form, Head } from '@inertiajs/react';
import FleetController from '@/actions/App/Http/Controllers/Pro/FleetController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleProviderFields from '@/components/workspace/vehicle-provider-fields';
import { vehicleProviderDefaults } from '@/lib/workspace-defaults';
import { show } from '@/routes/dashboard/fleet';
import type { VehicleProviderDetail } from '@/types';
import { t } from '@/lib/i18n';

export default function EditFleet({
    provider,
}: {
    provider: VehicleProviderDetail;
}) {
    return (
        <>
            <Head title={t('Edit business details')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Edit business details')}
                    description={t(
                        'Changing your RCCM number, tax ID or ID document sends your listing back for verification.',
                    )}
                    backHref={show()}
                    backLabel={t('Fleet & vehicles')}
                />

                <Form
                    {...FleetController.update.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleProviderFields
                                errors={errors}
                                defaults={vehicleProviderDefaults(provider)}
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

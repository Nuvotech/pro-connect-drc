import { Form, Head } from '@inertiajs/react';
import VehicleProviderController from '@/actions/App/Http/Controllers/Admin/VehicleProviderController';
import FleetFormSection from '@/components/workspace/fleet-form-section';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleProviderFields from '@/components/workspace/vehicle-provider-fields';
import { index as vehicleProvidersIndex } from '@/routes/admin/vehicle-providers';
import { t } from '@/lib/i18n';

export default function CreateVehicleProvider() {
    return (
        <>
            <Head title={t('Onboard vehicle provider')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Onboard a vehicle provider')}
                    description={t(
                        'Add an owner or company that rents out vehicles or equipment, together with their fleet.',
                    )}
                    backHref={vehicleProvidersIndex()}
                    backLabel={t('Fleet & vehicles')}
                />

                <Form
                    {...VehicleProviderController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleProviderFields
                                errors={errors}
                                showVerifiedToggle
                                fleet={
                                    <FleetFormSection
                                        errors={errors}
                                        description={t(
                                            'Each vehicle or model they rent out. Use quantity for identical units.',
                                        )}
                                    />
                                }
                            />
                            <FormActions
                                cancelHref={vehicleProvidersIndex()}
                                submitLabel={t('Onboard provider')}
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

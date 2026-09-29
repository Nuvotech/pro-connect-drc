import { Form, Head } from '@inertiajs/react';
import VehicleController from '@/actions/App/Http/Controllers/Pro/VehicleController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleFormCard from '@/components/workspace/vehicle-form-card';
import { vehicleDefaults } from '@/lib/workspace-defaults';
import { show } from '@/routes/dashboard/fleet';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

export default function EditVehicle({ vehicle }: { vehicle: FleetVehicle }) {
    return (
        <>
            <Head title={`Edit ${vehicle.make} ${vehicle.model}`} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={`${vehicle.make} ${vehicle.model}`}
                    description={t(
                        'Update the details or replace any of the photos.',
                    )}
                    backHref={show()}
                    backLabel={t('Fleet & vehicles')}
                />

                <Form
                    {...VehicleController.update.form(vehicle.id)}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleFormCard
                                errors={errors}
                                standalone
                                defaults={vehicleDefaults(vehicle)}
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

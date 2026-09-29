import { Form, Head } from '@inertiajs/react';
import CapturedVehicleController from '@/actions/App/Http/Controllers/Capture/CapturedVehicleController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleFormCard from '@/components/workspace/vehicle-form-card';
import { t } from '@/lib/i18n';
import { vehicleDefaults } from '@/lib/workspace-defaults';
import { show as showFleet } from '@/routes/captures/fleets';
import type { FleetVehicle } from '@/types';

/**
 * Add a vehicle to a captured fleet, or correct one.
 */
export default function CapturedVehicle({
    fleet,
    vehicle,
}: {
    fleet: { id: number; name: string };
    vehicle: FleetVehicle | null;
}) {
    const title = vehicle
        ? `${vehicle.make} ${vehicle.model}`
        : t('Add a vehicle');
    const form = vehicle
        ? CapturedVehicleController.update.form(vehicle.id)
        : CapturedVehicleController.store.form(fleet.id);

    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={title}
                    description={
                        vehicle
                            ? t(
                                  'Update the details or replace any of the photos.',
                              )
                            : t(
                                  'All 6 are required. Photos are resized automatically before upload.',
                              )
                    }
                    backHref={showFleet(fleet.id)}
                    backLabel={fleet.name}
                />

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleFormCard
                                errors={errors}
                                standalone
                                defaults={
                                    vehicle
                                        ? vehicleDefaults(vehicle)
                                        : undefined
                                }
                            />
                            <FormActions
                                cancelHref={showFleet(fleet.id)}
                                submitLabel={
                                    vehicle
                                        ? t('Save changes')
                                        : t('Add vehicle')
                                }
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

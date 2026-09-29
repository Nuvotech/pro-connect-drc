import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import CapturedFleetController from '@/actions/App/Http/Controllers/Capture/CapturedFleetController';
import CaptureStatus from '@/components/workspace/capture-status';
import FleetGrid from '@/components/workspace/fleet-grid';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleProviderFields from '@/components/workspace/vehicle-provider-fields';
import { t } from '@/lib/i18n';
import { vehicleProviderDefaults } from '@/lib/workspace-defaults';
import { index as capturesIndex } from '@/routes/captures';
import {
    create as createVehicle,
    destroy as destroyVehicle,
    edit as editVehicle,
} from '@/routes/captures/vehicles';
import type {
    FleetVehicle,
    ReviewSummary,
    VehicleProviderDetail,
} from '@/types';

export default function CapturedFleet({
    provider,
    vehicles,
    review,
    canEdit,
}: {
    provider: VehicleProviderDetail;
    vehicles: FleetVehicle[];
    review: ReviewSummary;
    canEdit: boolean;
}) {
    const title = provider.businessName ?? provider.contactName;

    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
                <PageHeader
                    title={title}
                    description={t('Fleet')}
                    backHref={capturesIndex()}
                    backLabel={t('My captures')}
                />

                <CaptureStatus review={review} canEdit={canEdit} />

                <section className="flex flex-col gap-4">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {t('Vehicles')}
                    </h2>
                    <FleetGrid
                        vehicles={vehicles}
                        emptyMessage={t(
                            'This fleet has no vehicles listed yet.',
                        )}
                        action={
                            canEdit && (
                                <Link
                                    href={createVehicle(provider.id)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                >
                                    <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('Add vehicle')}
                                </Link>
                            )
                        }
                        vehicleActions={
                            canEdit
                                ? (vehicle) => (
                                      <>
                                          <Link
                                              href={destroyVehicle(vehicle.id)}
                                              as="button"
                                              onBefore={() =>
                                                  confirm(
                                                      t(
                                                          'Remove the :make :model from your fleet?',
                                                          {
                                                              make: vehicle.make,
                                                              model: vehicle.model,
                                                          },
                                                      ),
                                                  )
                                              }
                                              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                          >
                                              <Trash2
                                                  className="size-4"
                                                  aria-hidden="true"
                                              />
                                              {t('Remove')}
                                          </Link>
                                          <Link
                                              href={editVehicle(vehicle.id)}
                                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                          >
                                              <Pencil
                                                  className="size-4"
                                                  aria-hidden="true"
                                              />
                                              {t('Edit vehicle')}
                                          </Link>
                                      </>
                                  )
                                : undefined
                        }
                    />
                </section>

                <section className="flex flex-col gap-4">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {t('Business details')}
                    </h2>
                    {canEdit ? (
                        <Form
                            {...CapturedFleetController.update.form(
                                provider.id,
                            )}
                            options={{ preserveScroll: true }}
                            className="flex flex-col gap-6"
                        >
                            {({ errors, processing, progress }) => (
                                <>
                                    <VehicleProviderFields
                                        errors={errors}
                                        defaults={vehicleProviderDefaults(
                                            provider,
                                        )}
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
                            <VehicleProviderFields
                                errors={{}}
                                defaults={vehicleProviderDefaults(provider)}
                            />
                        </fieldset>
                    )}
                </section>
            </div>
        </>
    );
}

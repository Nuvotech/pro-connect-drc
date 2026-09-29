import { Form, Head } from '@inertiajs/react';
import FleetController from '@/actions/App/Http/Controllers/Pro/FleetController';
import FleetFormSection from '@/components/workspace/fleet-form-section';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleProviderFields from '@/components/workspace/vehicle-provider-fields';
import type { VehicleProviderFieldDefaults } from '@/components/workspace/vehicle-provider-fields';
import { dashboard } from '@/routes';
import { t } from '@/lib/i18n';

/**
 * Pre-filled from the pro's join application when they have one.
 */
export default function CreateFleet({
    defaults,
}: {
    defaults: VehicleProviderFieldDefaults | null;
}) {
    return (
        <>
            <Head title={t('Set up your fleet')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Set up your fleet')}
                    description={t(
                        'Add your business details and the vehicles you rent out. An admin will verify them before your listing goes live.',
                    )}
                    backHref={dashboard()}
                    backLabel={t('Overview')}
                />

                <Form
                    {...FleetController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleProviderFields
                                errors={errors}
                                defaults={defaults ?? undefined}
                                fleet={
                                    <FleetFormSection
                                        errors={errors}
                                        description={t(
                                            'Each vehicle or model you rent out. Use quantity for identical units. You can add more later.',
                                        )}
                                    />
                                }
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

import { Form, Head } from '@inertiajs/react';
import VehicleController from '@/actions/App/Http/Controllers/Pro/VehicleController';
import FormActions from '@/components/workspace/form-actions';
import PageHeader from '@/components/workspace/page-header';
import VehicleFormCard from '@/components/workspace/vehicle-form-card';
import { show } from '@/routes/dashboard/fleet';
import { t } from '@/lib/i18n';

export default function CreateVehicle() {
    return (
        <>
            <Head title={t('Add a vehicle')} />

            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Add a vehicle')}
                    description={t(
                        'New vehicles are checked by an admin, so your fleet goes back to pending until then.',
                    )}
                    backHref={show()}
                    backLabel={t('Fleet & vehicles')}
                />

                <Form
                    {...VehicleController.store.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <VehicleFormCard errors={errors} standalone />
                            <FormActions
                                cancelHref={show()}
                                submitLabel={t('Add vehicle')}
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

import { Plus } from 'lucide-react';
import { useState } from 'react';
import VehicleFormCard from '@/components/workspace/vehicle-form-card';
import { t } from '@/lib/i18n';

/**
 * A growable list of vehicle cards for a fleet form, submitted as
 * `vehicles[index][field]`. Starts with one vehicle; cards can be added
 * and removed.
 */
export default function FleetFormSection({
    errors,
    description,
}: {
    errors: Record<string, string>;
    description: string;
}) {
    const [vehicleKeys, setVehicleKeys] = useState<number[]>([1]);

    function addVehicle() {
        setVehicleKeys((keys) => [...keys, Math.max(0, ...keys) + 1]);
    }

    function removeVehicle(key: number) {
        setVehicleKeys((keys) => keys.filter((value) => value !== key));
    }

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                        {t('Fleet')}
                    </h2>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        {description}
                    </p>
                </div>
                <span className="text-xs text-zinc-500 tabular-nums">
                    {vehicleKeys.length}{' '}
                    {vehicleKeys.length === 1 ? t('vehicle') : t('vehicles')}
                </span>
            </div>

            {vehicleKeys.map((key, index) => (
                <VehicleFormCard
                    key={key}
                    index={index}
                    errors={errors}
                    canRemove={vehicleKeys.length > 1}
                    onRemove={() => removeVehicle(key)}
                />
            ))}

            {errors.vehicles && (
                <p className="text-xs font-medium text-zinc-900">
                    {errors.vehicles}
                </p>
            )}

            <button
                type="button"
                onClick={addVehicle}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:border-zinc-400 hover:bg-white hover:text-zinc-900"
            >
                <Plus className="size-4" aria-hidden="true" />
                {t('Add another vehicle')}
            </button>
        </section>
    );
}

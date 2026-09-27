import FieldError from '@/components/directory/field-error';
import MaterialSymbol from '@/components/directory/material-symbol';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { categories } from '@/lib/directory-data';
import { cn } from '@/lib/utils';

export default function StepCategory({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="mb-2 text-headline-md text-on-surface">
                    What service do you need?
                </h2>
                <p className="text-body-md text-on-surface-variant">
                    Select the category that best fits your request.
                    <span className="mt-1 block text-label-sm text-outline italic">
                        Choisissez le métier qui correspond à votre besoin.
                    </span>
                </p>
            </div>

            <div
                role="radiogroup"
                aria-label="Service category"
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
            >
                {categories.map((category) => {
                    const isSelected = data.categorySlug === category.slug;

                    return (
                        <button
                            key={category.slug}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                                setField('categorySlug', category.slug)
                            }
                            className={cn(
                                'group flex flex-col items-center justify-center rounded-lg border bg-surface-container-lowest p-4 transition-all hover:border-primary hover:shadow-sm',
                                isSelected
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary-fixed'
                                    : 'border-outline-variant',
                            )}
                        >
                            <MaterialSymbol
                                name={category.icon}
                                filled={isSelected}
                                className="mb-2 text-primary transition-transform group-hover:scale-110"
                            />
                            <span className="text-label-md text-on-surface">
                                {category.name}
                            </span>
                            <span className="text-label-sm text-on-surface-variant">
                                {category.nameFr}
                            </span>
                        </button>
                    );
                })}
            </div>

            <FieldError message={errors.categorySlug} />
        </div>
    );
}

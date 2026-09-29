import MaterialSymbol from '@/components/directory/material-symbol';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

type ChoiceOption = {
    value: string;
    label: string;
    icon?: string;
};

type ChoiceChipsProps = {
    name: string;
    label: string;
    options: ChoiceOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

/**
 * A single-choice row of compact chips, backed by native radio inputs so
 * arrow keys and screen readers work as expected.
 */
export default function ChoiceChips({
    name,
    label,
    options,
    value,
    onChange,
    className,
}: ChoiceChipsProps) {
    return (
        <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-label-md text-on-surface">
                {t(label)}
            </legend>
            <div className={cn('grid gap-2', className)}>
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-2 py-2 text-center text-label-sm text-on-surface transition-colors duration-200 select-none hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />
                        {option.icon && (
                            <MaterialSymbol
                                name={option.icon}
                                className="shrink-0 text-[18px]"
                            />
                        )}
                        <span>{t(option.label)}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export type ComboboxOption = {
    slug: string;
    name: string;
    nameFr?: string;
};

export type ComboboxGroup = {
    label: string;
    options: ComboboxOption[];
};

type CustomServices = {
    values: string[];
    max: number;
    onChange: (values: string[]) => void;
};

type Row =
    | { kind: 'option'; option: ComboboxOption; group: string }
    | { kind: 'custom'; name: string };

/**
 * Lowercase and strip accents, so "macon" finds "Maçons".
 */
function normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * A searchable dropdown for picking several categories. Matches English
 * and French names, and can offer to add a service that isn't listed.
 */
export default function CategoryCombobox({
    id,
    groups,
    selected,
    onChange,
    custom,
    placeholder = 'Search services…',
    isInvalid = false,
}: {
    id?: string;
    groups: ComboboxGroup[];
    selected: string[];
    onChange: (selected: string[]) => void;
    custom?: CustomServices;
    placeholder?: string;
    isInvalid?: boolean;
}) {
    const generatedId = useId();
    const inputId = id ?? `${generatedId}-input`;
    const listboxId = `${generatedId}-listbox`;
    const container = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const allOptions = useMemo(
        () => groups.flatMap((group) => group.options),
        [groups],
    );
    const selectedOptions = selected
        .map((slug) => allOptions.find((option) => option.slug === slug))
        .filter((option): option is ComboboxOption => Boolean(option));

    const normalizedQuery = normalize(query);
    const visibleGroups = groups
        .map((group) => ({
            ...group,
            options: group.options.filter(
                (option) =>
                    !normalizedQuery ||
                    normalize(option.name).includes(normalizedQuery) ||
                    normalize(option.nameFr ?? '').includes(normalizedQuery),
            ),
        }))
        .filter((group) => group.options.length > 0);

    const trimmedQuery = query.trim().replace(/\s+/g, ' ');
    const hasExactMatch = allOptions.some(
        (option) =>
            normalize(option.name) === normalizedQuery ||
            normalize(option.nameFr ?? '') === normalizedQuery,
    );
    const isAlreadyCustom =
        custom?.values.some((value) => normalize(value) === normalizedQuery) ??
        false;
    const canAddCustom =
        Boolean(custom) &&
        trimmedQuery.length > 0 &&
        !hasExactMatch &&
        !isAlreadyCustom &&
        (custom?.values.length ?? 0) < (custom?.max ?? 0);

    const rows: Row[] = [
        ...visibleGroups.flatMap((group) =>
            group.options.map(
                (option) =>
                    ({ kind: 'option', option, group: group.label }) as Row,
            ),
        ),
        ...(canAddCustom
            ? [{ kind: 'custom', name: trimmedQuery } as Row]
            : []),
    ];
    const activeRow = rows[Math.min(activeIndex, rows.length - 1)];
    const optionId = (index: number) => `${generatedId}-option-${index}`;

    useEffect(() => {
        function closeOnOutsideClick(event: MouseEvent) {
            if (!container.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () =>
            document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    useEffect(() => {
        list.current
            ?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
            ?.scrollIntoView({ block: 'nearest' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex]);

    function toggle(slug: string) {
        onChange(
            selected.includes(slug)
                ? selected.filter((value) => value !== slug)
                : [...selected, slug],
        );
    }

    function choose(row: Row) {
        if (row.kind === 'option') {
            toggle(row.option.slug);

            return;
        }

        custom?.onChange([...custom.values, row.name]);
        setQuery('');
        setActiveIndex(0);
    }

    function changeQuery(value: string) {
        setQuery(value);
        setActiveIndex(0);
        setIsOpen(true);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((index) =>
                    rows.length === 0 ? 0 : (index + 1) % rows.length,
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((index) =>
                    rows.length === 0
                        ? 0
                        : (index - 1 + rows.length) % rows.length,
                );
                break;
            case 'Enter':
                if (isOpen && activeRow) {
                    event.preventDefault();
                    choose(activeRow);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'Backspace':
                if (query === '') {
                    if (custom && custom.values.length > 0) {
                        custom.onChange(custom.values.slice(0, -1));
                    } else if (selected.length > 0) {
                        onChange(selected.slice(0, -1));
                    }
                }
                break;
        }
    }

    let rowIndex = -1;

    return (
        <div ref={container} className="relative">
            <div
                onClick={() => {
                    input.current?.focus();
                    setIsOpen(true);
                }}
                className={cn(
                    'flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-white py-1.5 pr-9 pl-2 text-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
                    isInvalid ? 'border-error' : 'border-zinc-200',
                )}
            >
                {selectedOptions.map((option) => (
                    <Chip
                        key={option.slug}
                        label={option.name}
                        onRemove={() => toggle(option.slug)}
                    />
                ))}
                {custom?.values.map((value) => (
                    <Chip
                        key={value}
                        label={value}
                        note="new"
                        onRemove={() =>
                            custom.onChange(
                                custom.values.filter((item) => item !== value),
                            )
                        }
                    />
                ))}
                <input
                    ref={input}
                    id={inputId}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        isOpen && activeRow
                            ? optionId(rows.indexOf(activeRow))
                            : undefined
                    }
                    aria-invalid={isInvalid}
                    value={query}
                    onChange={(event) => changeQuery(event.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        selected.length > 0 || (custom?.values.length ?? 0) > 0
                            ? t('Add more…')
                            : placeholder
                    }
                    autoComplete="off"
                    className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:outline-none"
                />
            </div>
            <ChevronDown
                className={cn(
                    'pointer-events-none absolute top-3 right-3 size-4 text-zinc-400 transition-transform duration-200',
                    isOpen && 'rotate-180',
                )}
                aria-hidden="true"
            />

            {isOpen && (
                <ul
                    ref={list}
                    id={listboxId}
                    role="listbox"
                    aria-multiselectable="true"
                    aria-label={t('Services')}
                    className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
                >
                    {rows.length === 0 && (
                        <li className="px-3 py-6 text-center text-sm text-zinc-500">
                            {t('No match for “')}
                            {trimmedQuery}”
                        </li>
                    )}
                    {visibleGroups.map((group) => (
                        <li key={group.label} role="presentation">
                            <p className="sticky top-0 bg-white px-3 pt-2 pb-1 text-xs font-medium text-zinc-500">
                                {t(group.label)}
                            </p>
                            <ul role="group" aria-label={group.label}>
                                {group.options.map((option) => {
                                    rowIndex++;
                                    const index = rowIndex;
                                    const isSelected = selected.includes(
                                        option.slug,
                                    );

                                    return (
                                        <li
                                            key={option.slug}
                                            id={optionId(index)}
                                            role="option"
                                            aria-selected={isSelected}
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            onClick={() => toggle(option.slug)}
                                            onMouseEnter={() =>
                                                setActiveIndex(index)
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                                                index === activeIndex &&
                                                    'bg-zinc-100',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex size-4 shrink-0 items-center justify-center rounded border',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-zinc-300',
                                                )}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        className="size-3"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-zinc-900">
                                                {option.name}
                                            </span>
                                            {option.nameFr &&
                                                option.nameFr !==
                                                    option.name && (
                                                    <span className="shrink-0 truncate text-xs text-zinc-400">
                                                        {option.nameFr}
                                                    </span>
                                                )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}
                    {canAddCustom && (
                        <li
                            id={optionId(rows.length - 1)}
                            role="option"
                            aria-selected={false}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                                choose({ kind: 'custom', name: trimmedQuery })
                            }
                            onMouseEnter={() => setActiveIndex(rows.length - 1)}
                            className={cn(
                                'mt-1 flex cursor-pointer items-center gap-2 border-t border-zinc-100 px-3 py-2.5 text-sm text-primary',
                                activeIndex === rows.length - 1 &&
                                    'bg-zinc-100',
                            )}
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            {t('Add “')}
                            {trimmedQuery}
                            {t('” as a new service')}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

function Chip({
    label,
    note,
    onRemove,
}: {
    label: string;
    note?: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-100 pr-0.5 pl-2 text-sm text-zinc-800">
            {label}
            {note && (
                <span className="rounded bg-white px-1 text-[11px] text-zinc-500">
                    {note}
                </span>
            )}
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onRemove();
                }}
                aria-label={`Remove ${label}`}
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded text-zinc-500 transition-colors duration-200 hover:bg-zinc-200 hover:text-zinc-900"
            >
                <X className="size-3.5" aria-hidden="true" />
            </button>
        </span>
    );
}

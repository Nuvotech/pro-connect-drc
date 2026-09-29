import { Form, Head, router } from '@inertiajs/react';
import { Eye, EyeOff, Pencil, Plus, Search, Tags } from 'lucide-react';
import { useState } from 'react';
import AdminCategoryController from '@/actions/App/Http/Controllers/Admin/CategoryController';
import MaterialSymbol from '@/components/directory/material-symbol';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, inputClassName } from '@/components/workspace/form-fields';
import PageHeader from '@/components/workspace/page-header';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { toggle as toggleCategory } from '@/routes/admin/categories';

type AdminCategory = {
    id: number;
    slug: string;
    name: string;
    nameFr: string;
    icon: string;
    summary: string | null;
    description: string | null;
    isActive: boolean;
    listings: number;
};

type CategoryGroup = {
    value: string;
    label: string;
    categories: AdminCategory[];
};

/**
 * Lowercase and strip accents, so "electricien" finds "Électriciens".
 */
function normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function Categories({
    groups,
    icons,
}: {
    groups: CategoryGroup[];
    icons: string[];
}) {
    const [activeGroup, setActiveGroup] = useState(groups[0]?.value ?? 'trade');
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);

    const group =
        groups.find((item) => item.value === activeGroup) ?? groups[0];
    const normalizedQuery = normalize(query);
    const visible = (group?.categories ?? []).filter(
        (category) =>
            !normalizedQuery ||
            normalize(category.name).includes(normalizedQuery) ||
            normalize(category.nameFr).includes(normalizedQuery),
    );

    function setVisibility(category: AdminCategory, isActive: boolean) {
        router.patch(
            toggleCategory.url(category.id),
            { is_active: isActive },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={t('Services & categories')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <PageHeader
                        title={t('Services & categories')}
                        description={t(
                            'The services and vehicle types pros can be listed under. Hidden categories disappear from the site and the forms.',
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container sm:self-auto"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        {t('Add category')}
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 lg:flex-row lg:items-end">
                        <nav
                            aria-label={t('Category groups')}
                            className="-mb-px flex gap-6 overflow-x-auto"
                        >
                            {groups.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setActiveGroup(item.value)}
                                    aria-current={
                                        activeGroup === item.value
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex shrink-0 cursor-pointer items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                        activeGroup === item.value
                                            ? 'border-primary font-medium text-zinc-900'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    {item.label}
                                    <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums">
                                        {item.categories.length}
                                    </span>
                                </button>
                            ))}
                        </nav>
                        <div className="relative pb-3 lg:w-72">
                            <Search
                                className="pointer-events-none absolute top-[calc(50%-6px)] left-3 size-4 -translate-y-1/2 text-zinc-400"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                aria-label={t('Search categories')}
                                placeholder={t('Search in English or French…')}
                                className={cn(inputClassName, 'pl-9')}
                            />
                        </div>
                    </div>

                    {visible.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                            <Tags
                                className="size-6 text-zinc-400"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-zinc-900">
                                {t('No categories match')}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                            {visible.map((category) => (
                                <li
                                    key={category.id}
                                    className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                category.isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-zinc-100 text-zinc-400',
                                            )}
                                        >
                                            <MaterialSymbol
                                                name={category.icon}
                                                className="text-[20px]"
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <p
                                                className={cn(
                                                    'truncate text-sm font-medium',
                                                    category.isActive
                                                        ? 'text-zinc-900'
                                                        : 'text-zinc-400 line-through',
                                                )}
                                            >
                                                {category.name}
                                            </p>
                                            <p className="truncate text-xs text-zinc-500">
                                                {category.nameFr} ·{' '}
                                                {t(':count listings', {
                                                    count: category.listings,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVisibility(
                                                    category,
                                                    !category.isActive,
                                                )
                                            }
                                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                        >
                                            {category.isActive ? (
                                                <EyeOff
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Eye
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {category.isActive
                                                ? t('Hide')
                                                : t('Show')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(category)}
                                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                        >
                                            <Pencil
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            {t('Edit')}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <CategoryDialog
                key={
                    editing === null
                        ? 'closed'
                        : editing === 'new'
                          ? 'new'
                          : editing.id
                }
                category={editing}
                defaultGroup={activeGroup}
                groups={groups}
                icons={icons}
                onClose={() => setEditing(null)}
            />
        </>
    );
}

/**
 * Add or edit a category: names in both languages, an icon and optional
 * wording for the public category page.
 */
function CategoryDialog({
    category,
    defaultGroup,
    groups,
    icons,
    onClose,
}: {
    category: AdminCategory | 'new' | null;
    defaultGroup: string;
    groups: CategoryGroup[];
    icons: string[];
    onClose: () => void;
}) {
    const existing = category && category !== 'new' ? category : null;
    const [icon, setIcon] = useState(existing?.icon ?? icons[0]);
    const form = existing
        ? AdminCategoryController.update.form(existing.id)
        : AdminCategoryController.store.form();

    return (
        <Dialog
            open={category !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
                <DialogTitle>
                    {existing ? t('Edit category') : t('Add a category')}
                </DialogTitle>
                <DialogDescription>
                    {existing
                        ? t('Changes show on the site straight away.')
                        : t(
                              'It appears on the site and in the forms straight away.',
                          )}
                </DialogDescription>

                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    onSuccess={onClose}
                    className="flex flex-col gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            {!existing && (
                                <Field
                                    label={t('Group')}
                                    htmlFor="category-group"
                                    error={errors.group}
                                >
                                    <select
                                        id="category-group"
                                        name="group"
                                        defaultValue={defaultGroup}
                                        className={cn(
                                            inputClassName,
                                            'cursor-pointer',
                                        )}
                                    >
                                        {groups.map((group) => (
                                            <option
                                                key={group.value}
                                                value={group.value}
                                            >
                                                {group.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    label={t('Name in English')}
                                    htmlFor="category-name"
                                    error={errors.name}
                                >
                                    <input
                                        id="category-name"
                                        name="name"
                                        defaultValue={existing?.name}
                                        placeholder={t('e.g. Welders')}
                                        aria-invalid={Boolean(errors.name)}
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field
                                    label={t('Name in French')}
                                    htmlFor="category-name-fr"
                                    error={errors.name_fr}
                                >
                                    <input
                                        id="category-name-fr"
                                        name="name_fr"
                                        defaultValue={existing?.nameFr}
                                        placeholder={t('e.g. Soudeurs')}
                                        aria-invalid={Boolean(errors.name_fr)}
                                        className={inputClassName}
                                    />
                                </Field>
                            </div>

                            <fieldset className="flex flex-col gap-1.5">
                                <legend className="mb-1.5 text-sm font-medium text-zinc-900">
                                    {t('Icon')}
                                </legend>
                                <input type="hidden" name="icon" value={icon} />
                                <div
                                    role="radiogroup"
                                    aria-label={t('Icon')}
                                    className="grid grid-cols-7 gap-1.5 sm:grid-cols-9"
                                >
                                    {icons.map((name) => (
                                        <button
                                            key={name}
                                            type="button"
                                            role="radio"
                                            aria-checked={icon === name}
                                            aria-label={name.replaceAll(
                                                '_',
                                                ' ',
                                            )}
                                            onClick={() => setIcon(name)}
                                            className={cn(
                                                'flex aspect-square cursor-pointer items-center justify-center rounded-lg border transition-colors duration-200',
                                                icon === name
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-400',
                                            )}
                                        >
                                            <MaterialSymbol
                                                name={name}
                                                className="text-[20px]"
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.icon && (
                                    <p className="text-xs font-medium text-zinc-900">
                                        {errors.icon}
                                    </p>
                                )}
                            </fieldset>

                            <Field
                                label={t('Short summary')}
                                htmlFor="category-summary"
                                error={errors.summary}
                                isOptional
                            >
                                <input
                                    id="category-summary"
                                    name="summary"
                                    defaultValue={existing?.summary ?? ''}
                                    placeholder={t(
                                        'e.g. Gates, Grilles, Repairs',
                                    )}
                                    className={inputClassName}
                                />
                            </Field>

                            <Field
                                label={t('Description')}
                                htmlFor="category-description"
                                error={errors.description}
                                isOptional
                            >
                                <textarea
                                    id="category-description"
                                    name="description"
                                    rows={3}
                                    defaultValue={existing?.description ?? ''}
                                    className={cn(
                                        inputClassName,
                                        'h-auto resize-none py-2.5',
                                    )}
                                />
                            </Field>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex h-10 cursor-pointer items-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                                >
                                    {processing
                                        ? t('Saving…')
                                        : existing
                                          ? t('Save changes')
                                          : t('Add category')}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

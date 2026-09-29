import { Form, Head, router } from '@inertiajs/react';
import { UsersRound } from 'lucide-react';
import TeamController from '@/actions/App/Http/Controllers/Admin/TeamController';
import { inputClassName } from '@/components/workspace/form-fields';
import PageHeader from '@/components/workspace/page-header';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update as updateMember } from '@/routes/admin/team';

type Capturer = {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    captures: number;
    addedAt: string | null;
};

export default function Team({ capturers }: { capturers: Capturer[] }) {
    function setActive(capturer: Capturer, isActive: boolean) {
        router.patch(
            updateMember.url(capturer.id),
            { is_active: isActive },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={t('Team')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Team')}
                    description={t(
                        'Capturers can only sign in and add professionals and fleets. Everything they add waits for your review.',
                    )}
                />

                <section className="rounded-xl border border-zinc-200 bg-white p-6">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {t('Add a capturer')}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {t(
                            'They will get an email with a link to set their password.',
                        )}
                    </p>
                    <Form
                        {...TeamController.store.form()}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="team-name"
                                        className="text-sm font-medium text-zinc-900"
                                    >
                                        {t('Full name')}
                                    </label>
                                    <input
                                        id="team-name"
                                        name="name"
                                        type="text"
                                        autoComplete="off"
                                        aria-invalid={Boolean(errors.name)}
                                        className={inputClassName}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">
                                            {t(errors.name)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="team-email"
                                        className="text-sm font-medium text-zinc-900"
                                    >
                                        {t('Email')}
                                    </label>
                                    <input
                                        id="team-email"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        aria-invalid={Boolean(errors.email)}
                                        className={inputClassName}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">
                                            {t(errors.email)}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60 sm:mt-6"
                                >
                                    {processing
                                        ? t('Adding…')
                                        : t('Add capturer')}
                                </button>
                            </>
                        )}
                    </Form>
                </section>

                {capturers.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <UsersRound
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {t('No capturers yet')}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Name')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Captures')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Status')}
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            <span className="sr-only">
                                                {t('Actions')}
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {capturers.map((capturer) => (
                                        <tr key={capturer.id}>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-zinc-900">
                                                    {capturer.name}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {capturer.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-zinc-700 tabular-nums">
                                                {capturer.captures}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-xs font-medium',
                                                        capturer.isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-zinc-100 text-zinc-500',
                                                    )}
                                                >
                                                    {capturer.isActive
                                                        ? t('Active')
                                                        : t('Deactivated')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActive(
                                                            capturer,
                                                            !capturer.isActive,
                                                        )
                                                    }
                                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                                >
                                                    {capturer.isActive
                                                        ? t('Deactivate')
                                                        : t('Reactivate')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

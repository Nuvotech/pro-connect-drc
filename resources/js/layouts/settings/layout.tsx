import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import { t } from '@/lib/i18n';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {t('Settings')}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {t('Manage your profile and account security.')}
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                <nav
                    aria-label={t('Settings')}
                    className="flex gap-1 overflow-x-auto lg:w-48 lg:shrink-0 lg:flex-col"
                >
                    {sidebarNavItems.map((item) => {
                        const isActive = isCurrentOrParentUrl(item.href);

                        return (
                            <Link
                                key={toUrl(item.href)}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-9 shrink-0 items-center rounded-lg px-3 text-sm transition-colors duration-200',
                                    isActive
                                        ? 'bg-white font-medium text-zinc-900 shadow-[0_0_0_1px] shadow-zinc-200'
                                        : 'text-zinc-600 hover:bg-white hover:text-zinc-900',
                                )}
                            >
                                {t(item.title)}
                            </Link>
                        );
                    })}
                </nav>

                <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-6 md:p-8">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

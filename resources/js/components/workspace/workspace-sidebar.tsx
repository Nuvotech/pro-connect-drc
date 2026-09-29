import { Link, router, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import LanguageSwitch from '@/components/language-switch';
import { logout } from '@/routes';
import { t } from '@/lib/i18n';

export type WorkspaceNavItem = {
    title: string;
    icon: LucideIcon;
    href?: string;
    count?: number;
    matchesChildren?: boolean;
    /** Highlight the item for every URL starting with this path. */
    activePrefix?: string;
};

export type WorkspaceNavGroup = {
    title: string;
    items: WorkspaceNavItem[];
};

function initialsOf(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function WorkspaceSidebar({
    badge,
    homeHref,
    navGroups,
    className,
}: {
    badge: string;
    homeHref: string;
    navGroups: WorkspaceNavGroup[];
    className?: string;
}) {
    const { auth } = usePage().props;
    const { currentUrl, isCurrentUrl } = useCurrentUrl();

    function isItemActive(item: WorkspaceNavItem): boolean {
        if (item.activePrefix) {
            return currentUrl.startsWith(item.activePrefix);
        }

        return Boolean(
            item.href &&
            isCurrentUrl(item.href, undefined, item.matchesChildren),
        );
    }

    return (
        <aside
            className={cn(
                'flex w-64 flex-col border-r border-zinc-200 bg-white',
                className,
            )}
        >
            <Link
                href={homeHref}
                className="flex h-16 shrink-0 items-center gap-2 px-5"
            >
                <img
                    src="/images/logos/proconnect.png"
                    alt={t('ProConnect RDC')}
                    className="h-7 w-auto"
                />
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
                    {badge}
                </span>
            </Link>

            <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
                {navGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-0.5">
                        <span className="px-3 pb-1.5 text-xs font-medium text-zinc-500">
                            {t(group.title)}
                        </span>
                        {group.items.map((item) => (
                            <WorkspaceNavLink
                                key={item.title}
                                item={item}
                                isActive={isItemActive(item)}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2.5">
                <span className="text-xs text-zinc-500">{t('Language')}</span>
                <LanguageSwitch tone="workspace" />
            </div>

            {auth.user && (
                <div className="flex shrink-0 items-center gap-3 border-t border-zinc-200 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                        {initialsOf(auth.user.name)}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-zinc-900">
                            {auth.user.name}
                        </span>
                        <span className="truncate text-xs text-zinc-500">
                            {auth.user.email}
                        </span>
                    </div>
                    <Link
                        href={logout()}
                        as="button"
                        onClick={() => router.flushAll()}
                        aria-label={t('Log out')}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <LogOut className="size-4" />
                    </Link>
                </div>
            )}
        </aside>
    );
}

function WorkspaceNavLink({
    item,
    isActive,
}: {
    item: WorkspaceNavItem;
    isActive: boolean;
}) {
    const Icon = item.icon;
    const content = (
        <>
            <Icon
                className={cn(
                    'size-4 shrink-0',
                    isActive ? 'text-primary' : 'text-zinc-400',
                )}
                aria-hidden="true"
            />
            <span className="flex-1 truncate">{t(item.title)}</span>
            {item.count !== undefined && (
                <span className="text-xs text-zinc-500 tabular-nums">
                    {item.count}
                </span>
            )}
        </>
    );
    const className =
        'flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200';

    if (!item.href) {
        return (
            <span
                aria-disabled="true"
                title={t('Coming soon')}
                className={cn(className, 'cursor-default text-zinc-500')}
            >
                {content}
            </span>
        );
    }

    return (
        <Link
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                className,
                isActive
                    ? 'bg-zinc-100 font-medium text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
            )}
        >
            {content}
        </Link>
    );
}

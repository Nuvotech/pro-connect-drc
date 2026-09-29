import { Link, usePage } from '@inertiajs/react';
import { Bell, ExternalLink, Menu, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import WorkspaceSidebar from '@/components/workspace/workspace-sidebar';
import type { WorkspaceNavGroup } from '@/components/workspace/workspace-sidebar';
import { home } from '@/routes';
import { index as messagesIndex } from '@/routes/admin/messages';
import { t } from '@/lib/i18n';

/**
 * The shared frame of the admin panel and the pro dashboard: a light
 * sidebar, a slim top bar and a neutral page background.
 */
export default function WorkspaceLayout({
    badge,
    homeHref,
    navGroups,
    searchPlaceholder,
    children,
}: {
    badge: string;
    homeHref: string;
    navGroups: WorkspaceNavGroup[];
    searchPlaceholder?: string;
    children: ReactNode;
}) {
    const { unreadMessageCount } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarProps = { badge, homeHref, navGroups };

    return (
        <div className="proconnect min-h-screen bg-zinc-50 text-zinc-900">
            <WorkspaceSidebar
                {...sidebarProps}
                className="fixed inset-y-0 left-0 z-40 hidden lg:flex"
            />

            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <button
                        type="button"
                        aria-label={t('Close navigation')}
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute inset-0 bg-zinc-900/40"
                    />
                    <WorkspaceSidebar
                        {...sidebarProps}
                        className="relative h-full"
                    />
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur md:px-8">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label={t('Open navigation')}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden"
                    >
                        <Menu className="size-5" />
                    </button>
                    {searchPlaceholder && (
                        <div className="relative w-full max-w-md">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                aria-label={t('Search')}
                                placeholder={searchPlaceholder}
                                className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                            />
                        </div>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                        <Link
                            href={home()}
                            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex"
                        >
                            <ExternalLink
                                className="size-4"
                                aria-hidden="true"
                            />
                            {t('View site')}
                        </Link>
                        {typeof unreadMessageCount === 'number' && (
                            <Link
                                href={messagesIndex()}
                                aria-label={
                                    unreadMessageCount > 0
                                        ? t(':count new messages', {
                                              count: unreadMessageCount,
                                          })
                                        : t('Messages, none new')
                                }
                                title={
                                    unreadMessageCount > 0
                                        ? t(':count new messages', {
                                              count: unreadMessageCount,
                                          })
                                        : t('No new messages')
                                }
                                className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                <MessageSquare
                                    className="size-[18px]"
                                    aria-hidden="true"
                                />
                                {unreadMessageCount > 0 && (
                                    <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-white tabular-nums">
                                        {unreadMessageCount > 9
                                            ? '9+'
                                            : unreadMessageCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            type="button"
                            aria-label={t('Notifications')}
                            className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                            <Bell className="size-[18px]" />
                            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
                        </button>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        </div>
    );
}

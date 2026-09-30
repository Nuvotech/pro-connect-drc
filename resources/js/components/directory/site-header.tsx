import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import RateChecker from '@/components/directory/rate-checker';
import TownSwitcher from '@/components/directory/town-switcher';
import LanguageSwitch from '@/components/language-switch';
import { useActiveSection } from '@/hooks/use-active-section';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import {
    becomeAPro,
    contact,
    dashboard,
    home,
    login,
    logout,
    search,
} from '@/routes';
import { index as accountIndex } from '@/routes/account';
import { applications as adminApplications } from '@/routes/admin';
import { index as categoriesIndex } from '@/routes/categories';
import { index as vehiclesIndex } from '@/routes/vehicles';
import { t } from '@/lib/i18n';

type NavLink = {
    title: string;
    href: string;
    isActive: boolean;
};

export default function SiteHeader() {
    const { auth } = usePage().props;
    const { currentUrl, isCurrentUrl } = useCurrentUrl();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const isHomePage = isCurrentUrl(home());
    const activeHomeSection = useActiveSection(
        ['categories', 'business-services', 'vehicle-rental'],
        isHomePage,
    );
    const isBrowsingCategories = isHomePage
        ? activeHomeSection === 'categories' ||
          activeHomeSection === 'business-services'
        : currentUrl.startsWith('/categories') ||
          currentUrl.startsWith('/pros') ||
          isCurrentUrl(search());
    const isBrowsingVehicles = isHomePage
        ? activeHomeSection === 'vehicle-rental'
        : currentUrl.startsWith('/vehicles') ||
          currentUrl.startsWith('/fleets');

    const navLinks: NavLink[] = [
        {
            title: 'Home',
            href: home.url(),
            isActive: isHomePage && activeHomeSection === null,
        },
        {
            title: 'Categories',
            href: categoriesIndex.url(),
            isActive: isBrowsingCategories,
        },
        {
            title: 'Vehicle rental',
            href: vehiclesIndex.url(),
            isActive: isBrowsingVehicles,
        },
        {
            title: 'Become a Pro',
            href: becomeAPro.url(),
            isActive: isCurrentUrl(becomeAPro()),
        },
        {
            title: 'Contact us',
            href: contact.url(),
            isActive: isCurrentUrl(contact()),
        },
    ];

    const isCustomer = auth.user?.role === 'customer';
    const accountHref = auth.user
        ? auth.user.role === 'customer'
            ? accountIndex()
            : auth.user.role === 'admin'
              ? adminApplications()
              : dashboard()
        : login();
    const accountLabel = auth.user
        ? auth.user.role === 'customer'
            ? t('My account')
            : auth.user.role === 'admin'
              ? t('Admin')
              : t('Dashboard')
        : t('Login');

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.visit(search.url({ query: { q: searchTerm || undefined } }));
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface shadow-sm">
            <div className="flex items-center justify-end gap-3 border-b border-outline-variant/60 px-page py-1 sm:justify-between">
                <div className="hidden sm:block">
                    <TownSwitcher />
                </div>
                <div className="flex items-center gap-3">
                    <RateChecker />
                    <LanguageSwitch />
                </div>
            </div>
            <div className="flex items-center justify-between px-page py-3">
                <div className="flex items-center gap-6">
                    <Link href={home()} className="flex shrink-0 items-center">
                        <img
                            src="/images/logos/proconnect.png"
                            alt={t('ProConnect RDC')}
                            className="h-8 w-auto md:h-10"
                        />
                    </Link>
                    <div className="ml-10 hidden items-center gap-6 lg:flex">
                        {navLinks.map((navLink) => (
                            <Link
                                key={t(navLink.title)}
                                href={navLink.href}
                                className={cn(
                                    'text-label-md transition-colors duration-200 hover:text-primary',
                                    navLink.isActive
                                        ? 'border-b-2 border-primary pb-1 font-bold text-primary'
                                        : 'font-medium text-on-surface-variant',
                                )}
                            >
                                {t(navLink.title)}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <form
                        onSubmit={submitSearch}
                        className="hidden items-center rounded-full border border-outline-variant bg-surface-container px-4 py-2 md:flex"
                    >
                        <MaterialSymbol
                            name="search"
                            className="text-outline"
                        />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder={t('Search...')}
                            aria-label={t('Search professionals')}
                            className="ml-2 w-40 border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline lg:w-48"
                        />
                    </form>
                    <Link
                        href={accountHref}
                        className={cn(
                            'hidden h-11 items-center rounded-lg bg-primary text-label-md text-on-primary transition-opacity hover:opacity-90 sm:inline-flex',
                            isCustomer ? 'px-5' : 'px-6',
                        )}
                    >
                        {accountLabel}
                    </Link>
                    {isCustomer && (
                        <Link
                            href={logout()}
                            as="button"
                            className="hidden h-11 cursor-pointer items-center rounded-lg border border-outline-variant px-5 text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary sm:inline-flex"
                        >
                            {t('Log out')}
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary lg:hidden"
                        aria-expanded={isMenuOpen}
                        aria-label={t('Toggle navigation')}
                    >
                        <MaterialSymbol name={isMenuOpen ? 'close' : 'menu'} />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="flex flex-col gap-2 border-t border-outline-variant px-4 py-4 lg:hidden">
                    <form
                        onSubmit={submitSearch}
                        className="mb-2 flex items-center rounded-full border border-outline-variant bg-surface-container px-4 py-2 md:hidden"
                    >
                        <MaterialSymbol
                            name="search"
                            className="text-outline"
                        />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder={t('Search...')}
                            aria-label={t('Search professionals')}
                            className="ml-2 w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline"
                        />
                    </form>
                    {navLinks.map((navLink) => (
                        <Link
                            key={t(navLink.title)}
                            href={navLink.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                'rounded-lg px-4 py-2 text-label-md transition-colors hover:bg-surface-container-low',
                                navLink.isActive
                                    ? 'font-bold text-primary'
                                    : 'font-medium text-on-surface-variant',
                            )}
                        >
                            {t(navLink.title)}
                        </Link>
                    ))}
                    <div className="mt-2 flex flex-col gap-2 border-t border-outline-variant pt-4 sm:hidden">
                        <Link
                            href={accountHref}
                            onClick={() => setIsMenuOpen(false)}
                            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-label-md text-on-primary transition-opacity hover:opacity-90"
                        >
                            {accountLabel}
                        </Link>
                    </div>
                    {isCustomer && (
                        <Link
                            href={logout()}
                            as="button"
                            className="cursor-pointer rounded-lg px-4 py-2 text-left text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low sm:hidden"
                        >
                            {t('Log out')}
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}

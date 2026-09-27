import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useActiveSection } from '@/hooks/use-active-section';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { becomeAPro, dashboard, home, login, search } from '@/routes';

type NavLink = {
    title: string;
    href: string;
    isActive: boolean;
};

export default function SiteHeader() {
    const { auth } = usePage().props;
    const { currentUrl, isCurrentUrl } = useCurrentUrl();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [language, setLanguage] = useState<'fr' | 'en'>('en');
    const [searchTerm, setSearchTerm] = useState('');

    const isHomePage = isCurrentUrl(home());
    const activeHomeSection = useActiveSection(
        ['categories', 'business-services', 'how-it-works'],
        isHomePage,
    );
    const isBrowsingCategories = isHomePage
        ? activeHomeSection === 'categories' ||
          activeHomeSection === 'business-services'
        : currentUrl.startsWith('/categories') ||
          currentUrl.startsWith('/pros') ||
          isCurrentUrl(search());
    const isViewingHowItWorks =
        isHomePage && activeHomeSection === 'how-it-works';

    const navLinks: NavLink[] = [
        {
            title: 'Home',
            href: home.url(),
            isActive: isHomePage && activeHomeSection === null,
        },
        {
            title: 'Categories',
            href: `${home.url()}#categories`,
            isActive: isBrowsingCategories,
        },
        {
            title: 'How it Works',
            href: `${home.url()}#how-it-works`,
            isActive: isViewingHowItWorks,
        },
        {
            title: 'Become a Pro',
            href: becomeAPro.url(),
            isActive: isCurrentUrl(becomeAPro()),
        },
    ];

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.visit(search.url({ query: { q: searchTerm || undefined } }));
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface shadow-sm">
            <div className="flex items-center justify-between px-page py-4">
                <div className="flex items-center gap-6">
                    <Link href={home()} className="flex shrink-0 items-center">
                        <img
                            src="/images/logos/proconnect-landscape.png"
                            alt="ProConnect RDC"
                            className="h-8 w-auto md:h-10"
                        />
                    </Link>
                    <div className="ml-10 hidden items-center gap-6 lg:flex">
                        {navLinks.map((navLink) => (
                            <Link
                                key={navLink.title}
                                href={navLink.href}
                                className={cn(
                                    'text-label-md transition-colors duration-200 hover:text-primary',
                                    navLink.isActive
                                        ? 'border-b-2 border-primary pb-1 font-bold text-primary'
                                        : 'font-medium text-on-surface-variant',
                                )}
                            >
                                {navLink.title}
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
                            placeholder="Search..."
                            aria-label="Search professionals"
                            className="ml-2 w-40 border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline lg:w-48"
                        />
                    </form>
                    <button
                        type="button"
                        onClick={() =>
                            setLanguage(language === 'en' ? 'fr' : 'en')
                        }
                        className="text-label-md font-semibold text-on-surface-variant transition-colors hover:text-primary"
                        aria-label="Switch language"
                    >
                        <span
                            className={cn(
                                language === 'fr' &&
                                    'border-b border-primary text-primary',
                            )}
                        >
                            FR
                        </span>{' '}
                        |{' '}
                        <span
                            className={cn(
                                language === 'en' &&
                                    'border-b border-primary text-primary',
                            )}
                        >
                            EN
                        </span>
                    </button>
                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="rounded-lg bg-primary px-6 py-2 text-label-md text-on-primary transition-opacity hover:opacity-90"
                    >
                        {auth.user ? 'Dashboard' : 'Login'}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center text-on-surface-variant hover:text-primary lg:hidden"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
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
                            placeholder="Search..."
                            aria-label="Search professionals"
                            className="ml-2 w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-outline"
                        />
                    </form>
                    {navLinks.map((navLink) => (
                        <Link
                            key={navLink.title}
                            href={navLink.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                'rounded-lg px-4 py-2 text-label-md transition-colors hover:bg-surface-container-low',
                                navLink.isActive
                                    ? 'font-bold text-primary'
                                    : 'font-medium text-on-surface-variant',
                            )}
                        >
                            {navLink.title}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

import { Link } from '@inertiajs/react';
import {
    becomeAPro,
    contact,
    home,
    login,
    search,
    serviceRequest,
} from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as vehiclesIndex } from '@/routes/vehicles';
import { t } from '@/lib/i18n';

const linkClassName =
    'text-label-sm text-on-primary opacity-80 transition-all hover:underline hover:opacity-100';

const columns = [
    {
        title: 'Find a pro',
        links: [
            { label: 'All services', href: categoriesIndex.url() },
            { label: 'Search professionals', href: search.url() },
            { label: 'How it works', href: `${home.url()}#how-it-works` },
        ],
    },
    {
        title: 'Businesses',
        links: [
            { label: 'Request a business service', href: serviceRequest.url() },
            { label: 'Vehicle & equipment rental', href: vehiclesIndex.url() },
        ],
    },
    {
        title: 'Professionals',
        links: [
            { label: 'Join as a pro', href: becomeAPro.url() },
            { label: 'Pro login', href: login.url() },
        ],
    },
    {
        title: 'ProConnect',
        links: [{ label: 'Contact us', href: contact.url() }],
    },
];

export default function SiteFooter() {
    return (
        <footer className="mt-auto w-full bg-primary">
            <div className="grid w-full grid-cols-1 gap-8 px-page py-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <div className="flex flex-col gap-4">
                    <Link href={home()} className="self-start">
                        <img
                            src="/images/logos/proconnect-light.png"
                            alt={t('ProConnect RDC')}
                            className="h-8 w-auto"
                        />
                    </Link>
                    <p className="mt-2 text-body-md text-on-primary opacity-80">
                        {t(
                            'Connecting reliable professionals with local projects across the DRC.',
                        )}
                    </p>
                </div>
                {columns.map((column) => (
                    <nav
                        key={column.title}
                        aria-label={t(column.title)}
                        className="flex flex-col gap-3"
                    >
                        <h2 className="mb-2 text-label-md font-bold text-secondary-container">
                            {t(column.title)}
                        </h2>
                        {column.links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={linkClassName}
                            >
                                {t(link.label)}
                            </Link>
                        ))}
                    </nav>
                ))}
                <div className="col-span-1 mt-6 border-t border-on-primary/20 pt-6 sm:col-span-2 md:col-span-4">
                    <p className="text-label-sm text-on-primary opacity-60">
                        © {new Date().getFullYear()}{' '}
                        {t(
                            'ProConnect RDC. Tous droits réservés / All rights reserved.',
                        )}
                    </p>
                </div>
            </div>
        </footer>
    );
}

import { usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    ClipboardList,
    LayoutDashboard,
    Settings,
    Star,
    Store,
    Truck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type {
    WorkspaceNavGroup,
    WorkspaceNavItem,
} from '@/components/workspace/workspace-sidebar';
import WorkspaceLayout from '@/layouts/workspace-layout';
import { dashboard } from '@/routes';
import {
    create as fleetCreate,
    show as fleetShow,
} from '@/routes/dashboard/fleet';
import {
    create as listingCreate,
    show as listingShow,
} from '@/routes/dashboard/listing';
import { index as bookingsIndex } from '@/routes/dashboard/bookings';
import { index as quotesIndex } from '@/routes/dashboard/quotes';
import { index as reviewsIndex } from '@/routes/dashboard/reviews';
import { edit as editProfile } from '@/routes/profile';
import type { AuthPro } from '@/types';
import { t } from '@/lib/i18n';

/**
 * Listing links for an approved pro: a service listing, a fleet, or both,
 * depending on what they offer. Nothing until they are approved.
 */
function listingNavItems(pro: AuthPro | null): WorkspaceNavItem[] {
    if (!pro?.isApproved) {
        return [];
    }

    const items: WorkspaceNavItem[] = [];

    if (pro.offersServices) {
        items.push({
            title: 'My listing',
            icon: Store,
            href: pro.listings.professional
                ? listingShow.url()
                : listingCreate.url(),
            activePrefix: '/dashboard/listing',
        });
    }

    if (pro.offersVehicles) {
        items.push({
            title: 'Fleet & vehicles',
            icon: Truck,
            href: pro.listings.vehicleProvider
                ? fleetShow.url()
                : fleetCreate.url(),
            activePrefix: '/dashboard/fleet',
        });
    }

    return items;
}

/**
 * Inboxes for the listings the pro has: quote requests for a service
 * listing, bookings for a fleet.
 */
function businessNavItems(pro: AuthPro | null): WorkspaceNavItem[] {
    if (!pro?.isApproved) {
        return [{ title: 'Quote requests', icon: ClipboardList }];
    }

    const items: WorkspaceNavItem[] = [];

    if (pro.listings.professional) {
        items.push({
            title: 'Quote requests',
            icon: ClipboardList,
            href: quotesIndex.url(),
            activePrefix: '/dashboard/quotes',
            count: pro.openQuoteCount || undefined,
        });
    }

    if (pro.listings.vehicleProvider) {
        items.push({
            title: 'Bookings',
            icon: CalendarCheck,
            href: bookingsIndex.url(),
            activePrefix: '/dashboard/bookings',
            count: pro.pendingBookingCount || undefined,
        });
    }

    return items.length > 0
        ? items
        : [{ title: 'Quote requests', icon: ClipboardList }];
}

function proNavGroups(pro: AuthPro | null): WorkspaceNavGroup[] {
    return [
        {
            title: 'Workspace',
            items: [
                {
                    title: 'Overview',
                    icon: LayoutDashboard,
                    href: dashboard.url(),
                },
                ...listingNavItems(pro),
            ],
        },
        {
            title: 'Business',
            items: [
                ...businessNavItems(pro),
                {
                    title: 'Reviews',
                    icon: Star,
                    href: pro?.isApproved ? reviewsIndex.url() : undefined,
                },
            ],
        },
        {
            title: 'Account',
            items: [
                {
                    title: 'Settings',
                    icon: Settings,
                    href: editProfile.url(),
                    activePrefix: '/settings',
                },
            ],
        },
    ];
}

export default function ProLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;

    return (
        <WorkspaceLayout
            badge={t('Pro')}
            homeHref={dashboard.url()}
            navGroups={proNavGroups(auth.pro ?? null)}
        >
            {children}
        </WorkspaceLayout>
    );
}

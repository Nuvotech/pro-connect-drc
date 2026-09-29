import { usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Banknote,
    ClipboardList,
    FileCheck2,
    Mail,
    Settings,
    Star,
    Truck,
    UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { WorkspaceNavGroup } from '@/components/workspace/workspace-sidebar';
import WorkspaceLayout from '@/layouts/workspace-layout';
import { applications } from '@/routes/admin';
import { edit as editExchangeRate } from '@/routes/admin/exchange-rate';
import { index as messagesIndex } from '@/routes/admin/messages';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { index as professionalsIndex } from '@/routes/admin/professionals';
import { index as requestsIndex } from '@/routes/admin/requests';
import { index as signUpsIndex } from '@/routes/admin/sign-ups';
import { index as vehicleProvidersIndex } from '@/routes/admin/vehicle-providers';
import { edit as editProfile } from '@/routes/profile';
import { t } from '@/lib/i18n';

function adminNavGroups(
    reviewQueueCount?: number | null,
    signUpQueueCount?: number | null,
    requestQueueCount?: number | null,
    pendingReviewCount?: number | null,
    unreadMessageCount?: number | null,
): WorkspaceNavGroup[] {
    return [
        {
            title: 'Admissions',
            items: [
                {
                    title: 'Sign-ups',
                    icon: UserPlus,
                    href: signUpsIndex.url(),
                    count: signUpQueueCount ?? undefined,
                    matchesChildren: true,
                },
                {
                    title: 'Listing reviews',
                    icon: FileCheck2,
                    href: applications.url(),
                    count: reviewQueueCount ?? undefined,
                    matchesChildren: true,
                },
                {
                    title: 'Professionals',
                    icon: BadgeCheck,
                    href: professionalsIndex.url(),
                    matchesChildren: true,
                },
            ],
        },
        {
            title: 'Operations',
            items: [
                {
                    title: 'Requests',
                    icon: ClipboardList,
                    href: requestsIndex.url(),
                    count: requestQueueCount ?? undefined,
                    matchesChildren: true,
                },
                {
                    title: 'Fleet & vehicles',
                    icon: Truck,
                    href: vehicleProvidersIndex.url(),
                    matchesChildren: true,
                },
                {
                    title: 'Exchange rate',
                    icon: Banknote,
                    href: editExchangeRate.url(),
                },
            ],
        },
        {
            title: 'Clients',
            items: [
                {
                    title: 'Messages',
                    icon: Mail,
                    href: messagesIndex.url(),
                    count: unreadMessageCount ?? undefined,
                    matchesChildren: true,
                },
                {
                    title: 'Reviews & ratings',
                    icon: Star,
                    href: reviewsIndex.url(),
                    count: pendingReviewCount ?? undefined,
                    matchesChildren: true,
                },
            ],
        },
        {
            title: 'System',
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

export default function AdminLayout({ children }: { children: ReactNode }) {
    const {
        reviewQueueCount,
        signUpQueueCount,
        requestQueueCount,
        pendingReviewCount,
        unreadMessageCount,
    } = usePage().props;

    return (
        <WorkspaceLayout
            badge={t('Admin')}
            homeHref={applications.url()}
            navGroups={adminNavGroups(
                reviewQueueCount,
                signUpQueueCount,
                requestQueueCount,
                pendingReviewCount,
                unreadMessageCount,
            )}
            searchPlaceholder={t('Search professionals, dossiers, RCCM…')}
        >
            {children}
        </WorkspaceLayout>
    );
}

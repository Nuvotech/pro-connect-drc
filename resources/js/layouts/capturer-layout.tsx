import { ClipboardList, Settings, Truck, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WorkspaceNavGroup } from '@/components/workspace/workspace-sidebar';
import WorkspaceLayout from '@/layouts/workspace-layout';
import { t } from '@/lib/i18n';
import { create as createProfessional } from '@/routes/admin/professionals';
import { create as createVehicleProvider } from '@/routes/admin/vehicle-providers';
import { index as capturesIndex } from '@/routes/captures';
import { edit as editProfile } from '@/routes/profile';

const capturerNavGroups: WorkspaceNavGroup[] = [
    {
        title: 'Capture',
        items: [
            {
                title: 'My captures',
                icon: ClipboardList,
                href: capturesIndex.url(),
            },
            {
                title: 'Add a professional',
                icon: UserPlus,
                href: createProfessional.url(),
            },
            {
                title: 'Add a fleet',
                icon: Truck,
                href: createVehicleProvider.url(),
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

/**
 * The workspace for capturers: staff who only add professionals and
 * fleets for review.
 */
export default function CapturerLayout({ children }: { children: ReactNode }) {
    return (
        <WorkspaceLayout
            badge={t('Capturer')}
            homeHref={capturesIndex.url()}
            navGroups={capturerNavGroups}
        >
            {children}
        </WorkspaceLayout>
    );
}

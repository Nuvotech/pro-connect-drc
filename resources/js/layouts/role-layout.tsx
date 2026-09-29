import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ProLayout from '@/layouts/pro-layout';

/**
 * Wraps pages shared by admins and pros (such as settings) in the
 * workspace that belongs to the signed-in user.
 */
export default function RoleLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;

    return auth.user?.role === 'admin' ? (
        <AdminLayout>{children}</AdminLayout>
    ) : (
        <ProLayout>{children}</ProLayout>
    );
}

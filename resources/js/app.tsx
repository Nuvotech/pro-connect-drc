import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import TranslationScope from '@/components/translation-scope';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AuthLayout from '@/layouts/auth-layout';
import CapturerLayout from '@/layouts/capturer-layout';
import ProLayout from '@/layouts/pro-layout';
import PublicFocusLayout from '@/layouts/public-focus-layout';
import PublicLayout from '@/layouts/public-layout';
import RoleLayout from '@/layouts/role-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'ProConnect RDC';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'public/service-request' ||
                name === 'public/become-a-pro' ||
                name === 'public/review' ||
                name === 'account/register':
                return [TranslationScope, PublicFocusLayout];
            case name.startsWith('public/') || name.startsWith('account/'):
                return [TranslationScope, PublicLayout];
            case name.startsWith('captures/'):
                return [TranslationScope, CapturerLayout];
            case name.startsWith('admin/'):
                return [TranslationScope, AdminLayout];
            case name === 'dashboard' || name.startsWith('dashboard/'):
                return [TranslationScope, ProLayout];
            case name.startsWith('auth/'):
                return [TranslationScope, AuthLayout];
            case name.startsWith('settings/'):
                return [TranslationScope, RoleLayout, SettingsLayout];
            default:
                return [TranslationScope, PublicLayout];
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

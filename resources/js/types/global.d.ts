import type { Auth, SharedCategory } from '@/types/auth';
import type { City, ExchangeRate } from '@/types/directory';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            locale: 'fr' | 'en';
            translations?: Record<string, string>;
            auth: Auth;
            sidebarOpen: boolean;
            reviewQueueCount?: number | null;
            signUpQueueCount?: number | null;
            requestQueueCount?: number | null;
            pendingReviewCount?: number | null;
            unreadMessageCount?: number | null;
            categories: SharedCategory[];
            cities: City[];
            exchangeRate: ExchangeRate | null;
            [key: string]: unknown;
        };
    }
}

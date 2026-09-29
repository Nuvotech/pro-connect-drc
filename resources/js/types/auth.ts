export type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'pro' | 'customer';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type AuthListing = {
    id: number;
    isVerified: boolean;
};

/**
 * What a pro may set up and what they already manage.
 */
export type AuthPro = {
    isApproved: boolean;
    offersServices: boolean;
    offersVehicles: boolean;
    openQuoteCount: number;
    pendingBookingCount: number;
    listings: {
        professional: AuthListing | null;
        vehicleProvider: AuthListing | null;
    };
};

export type Auth = {
    user: User;
    pro?: AuthPro | null;
};

export type CategoryGroup = 'trade' | 'business' | 'vehicle';

export type SharedCategory = {
    slug: string;
    /** The name in the active language. */
    name: string;
    nameEn: string;
    nameFr: string;
    group: CategoryGroup;
    icon: string;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

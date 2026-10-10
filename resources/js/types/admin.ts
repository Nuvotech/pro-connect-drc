import type { CategoryGroup } from './auth';

export type DocumentTone = 'verified' | 'warning';

export type ReviewStatus =
    | 'pending'
    | 'resubmitted'
    | 'changes_requested'
    | 'approved'
    | 'declined';

export type ReviewTab =
    | 'needs_review'
    | 'changes_requested'
    | 'approved'
    | 'declined';

export type ReviewDecision = 'approve' | 'request_changes' | 'decline';

/** Whether a pro works for themselves or represents a registered company. */
export type ProviderType = 'individual' | 'company';

export type ChecklistItem = { key: string; label: string; isDone: boolean };

export type ReviewEvent = {
    id: number;
    event: string;
    message: string | null;
    internalNote: string | null;
    reviewerName: string | null;
    at: string | null;
};

export type ReviewDocument = {
    key: string;
    label: string;
    isOnFile: boolean;
    url: string | null;
};

export type ReviewApplication = {
    key: string;
    type: 'professional' | 'vehicle_provider';
    id: number;
    providerType: ProviderType;
    name: string;
    contactName: string;
    categories: string[];
    phone: string;
    email: string | null;
    city: string;
    commune: string;
    address: string | null;
    photoUrl: string | null;
    bio: string | null;
    experienceYears: number | null;
    registryNumber: string | null;
    taxId: string | null;
    reviewStatus: ReviewStatus;
    isVerified: boolean;
    submittedAt: string | null;
    submittedAgo: string | null;
    checklist: ChecklistItem[];
    missingCount: number;
    /** Company registration items still missing; approval is blocked until empty. */
    missingCompanyDetails: string[];
    documents: ReviewDocument[];
    galleryCount: number | null;
    vehicles: {
        id: number;
        name: string;
        category: string;
        quantity: number;
        photoCount: number;
        requiredPhotoCount: number;
    }[];
    detailUrl: string | null;
    reviews: ReviewEvent[];
};

export type OnboardedProfessional = {
    id: number;
    fullName: string;
    businessName: string | null;
    categories: string[];
    city: string;
    commune: string;
    phone: string;
    photoUrl: string | null;
    isVerified: boolean;
    createdAt: string | null;
};

export type Paginated<TItem> = {
    data: TItem[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type VehicleProviderSummary = {
    id: number;
    contactName: string;
    businessName: string | null;
    city: string;
    commune: string;
    phone: string;
    vehicleCount: number;
    categories: string[];
    lowestDailyRate: { amount: string; currency: string } | null;
    isVerified: boolean;
    createdAt: string | null;
};

export type DailyRate = { amount: string; currency: string };

export type VehicleProviderDetail = {
    id: number;
    providerType: ProviderType;
    contactName: string;
    businessName: string | null;
    phone: string;
    isOnWhatsApp: boolean;
    email: string | null;
    city: string;
    commune: string;
    address: string | null;
    registryNumber: string | null;
    taxId: string | null;
    preferredLanguage: string;
    hasIdentityDocument: boolean;
    hasBusinessRegistration: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
    onboardedBy?: string | null;
    createdAt: string | null;
    lowestDailyRate: DailyRate | null;
};

export type FleetVehicle = {
    id: number;
    category: string;
    make: string;
    model: string;
    year: number;
    /** Hidden (null) on public pages. */
    registrationNumber: string | null;
    transmission: string;
    fuelType: string;
    seats: number | null;
    payloadTonnes: string | null;
    driverOption: string;
    dailyRate: string;
    currency: string;
    deposit: string | null;
    minimumRentalDays: number;
    quantity: number;
    insuranceExpiresOn: string | null;
    isInsuranceExpired: boolean;
    notes: string | null;
    photos: { angle: string; url: string }[];
};

export type ProfessionalListing = {
    id: number;
    providerType: ProviderType;
    categories: string[];
    fullName: string;
    businessName: string | null;
    phone: string;
    isOnWhatsApp: boolean;
    email: string | null;
    city: string;
    commune: string;
    address: string | null;
    experienceYears: number | null;
    registryNumber: string | null;
    taxId: string | null;
    bio: string | null;
    preferredLanguage: string;
    photoUrl: string | null;
    coverUrl: string | null;
    hasIdentityDocument: boolean;
    hasBusinessRegistration: boolean;
    gallery: string[];
    isVerified: boolean;
    verifiedAt: string | null;
    createdAt: string | null;
};

export type DashboardOverview = {
    type: 'professional' | 'vehicle_provider';
    name: string;
    isVerified: boolean;
    reviewStatus: ReviewStatus;
    submittedAt: string | null;
    canResubmit: boolean;
    adminMessage: string | null;
    decidedAt: string | null;
    checklist: ChecklistItem[];
    firstVehicleMissingPhotosId?: number | null;
    stats: { label: string; value: string }[];
};

export type ReviewSummary = {
    isVerified: boolean;
    reviewStatus: ReviewStatus;
    submittedAt: string | null;
    canResubmit: boolean;
    adminMessage: string | null;
    decidedAt: string | null;
};

export type ProApplicationStatus = 'pending' | 'approved' | 'declined';

/**
 * Where a pro's join application stands, shown while the dashboard is
 * locked.
 */
export type DashboardApplication = {
    status: ProApplicationStatus;
    services: string[];
    submittedAt: string | null;
    decisionMessage: string | null;
};

export type ProApplicationCustomService = {
    id: number;
    name: string;
    categoryName: string | null;
};

export type ProApplicationDetail = {
    id: number;
    providerType: ProviderType;
    fullName: string;
    businessName: string | null;
    email: string | null;
    /** Whether the applicant has opened their verification link. */
    isVerified: boolean;
    /** The link to send them by hand; null once they are verified. */
    verificationUrl: string | null;
    phone: string;
    isOnWhatsApp: boolean;
    city: string | null;
    commune: string | null;
    description: string | null;
    status: ProApplicationStatus;
    categories: { slug: string; name: string; group: CategoryGroup }[];
    customServices: ProApplicationCustomService[];
    submittedAt: string | null;
    decidedAt: string | null;
    decidedBy: string | null;
    decisionMessage: string | null;
};

export type CategoryOptionGroup = {
    group: CategoryGroup;
    label: string;
    options: { slug: string; name: string; nameFr: string }[];
};

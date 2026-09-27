import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import { categories } from '@/lib/directory-data';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

const signupSteps = ['Personal', 'Trade', 'Docs', 'Gallery', 'Done'];

const maxGalleryPhotos = 6;

type SignupData = {
    fullName: string;
    location: string;
    profilePhoto: File | null;
    trade: string;
    experienceYears: string;
    bio: string;
    identityDocument: File | null;
    businessRegistration: File | null;
    gallery: File[];
};

type SignupErrors = Partial<Record<keyof SignupData, string>>;

function validateSignupStep(step: number, data: SignupData): SignupErrors {
    const errors: SignupErrors = {};

    if (step === 0) {
        if (!data.fullName.trim()) {
            errors.fullName = 'Please enter your full name.';
        }

        if (!data.location.trim()) {
            errors.location = 'Please enter your city and commune.';
        }
    }

    if (step === 1) {
        if (!data.trade) {
            errors.trade = 'Please choose your trade.';
        }

        if (!data.experienceYears) {
            errors.experienceYears = 'Please enter your years of experience.';
        }
    }

    if (step === 2 && !data.identityDocument) {
        errors.identityDocument = 'Please upload a valid ID document.';
    }

    return errors;
}

function usePreviewUrl(file: File | null): string | null {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);

            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return previewUrl;
}

export default function BecomeAPro() {
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState<SignupErrors>({});
    const [data, setData] = useState<SignupData>({
        fullName: '',
        location: '',
        profilePhoto: null,
        trade: '',
        experienceYears: '',
        bio: '',
        identityDocument: null,
        businessRegistration: null,
        gallery: [],
    });
    const profilePhotoInput = useRef<HTMLInputElement>(null);
    const galleryInput = useRef<HTMLInputElement>(null);
    const profilePhotoUrl = usePreviewUrl(data.profilePhoto);
    const isComplete = step === signupSteps.length - 1;

    function setField<TKey extends keyof SignupData>(
        key: TKey,
        value: SignupData[TKey],
    ) {
        setData((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
    }

    function selectFile(
        key: 'profilePhoto' | 'identityDocument' | 'businessRegistration',
    ) {
        return (event: ChangeEvent<HTMLInputElement>) => {
            setField(key, event.target.files?.[0] ?? null);
        };
    }

    function addGalleryPhotos(event: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files ?? []).filter(
            (file) => file.type.startsWith('image/'),
        );

        setField(
            'gallery',
            [...data.gallery, ...selectedFiles].slice(0, maxGalleryPhotos),
        );
        event.target.value = '';
    }

    function submitStep(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const stepErrors = validateSignupStep(step, data);
        setErrors(stepErrors);

        if (Object.keys(stepErrors).length === 0) {
            setStep(step + 1);
        }
    }

    return (
        <>
            <Head title="Join ProConnect" />

            <div className="flex w-full flex-grow items-center justify-center px-page py-4 md:py-12">
                <div className="relative w-full max-w-3xl overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:p-6">
                    <div className="mb-8">
                        <h1 className="mb-2 text-headline-lg-mobile text-primary md:text-headline-lg">
                            Join ProConnect
                        </h1>
                        <p className="text-body-md text-on-surface-variant">
                            Complete your professional profile to start
                            receiving service requests.
                        </p>

                        <div className="relative mt-6 flex items-center justify-between">
                            <div className="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 bg-surface-variant" />
                            <div
                                className="absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 bg-primary transition-all duration-300"
                                style={{
                                    width: `${(step / (signupSteps.length - 1)) * 100}%`,
                                }}
                            />
                            {signupSteps.map((label, index) => (
                                <div
                                    key={label}
                                    className={cn(
                                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-label-md',
                                        index <= step
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-variant text-on-surface-variant',
                                    )}
                                >
                                    {index === signupSteps.length - 1 ||
                                    index < step ? (
                                        <MaterialSymbol
                                            name="check"
                                            className="text-[18px]"
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-label-sm text-on-surface-variant">
                            {signupSteps.map((label) => (
                                <span key={label}>{label}</span>
                            ))}
                        </div>
                    </div>

                    {isComplete ? (
                        <div className="flex flex-col items-center gap-6 py-10 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-primary">
                                <MaterialSymbol
                                    name="check_circle"
                                    filled
                                    className="text-5xl"
                                />
                            </div>
                            <div className="flex max-w-lg flex-col gap-2">
                                <h2 className="text-headline-md text-on-surface">
                                    Application submitted!
                                </h2>
                                <p className="text-body-md text-on-surface-variant">
                                    Thanks {data.fullName.split(' ')[0]}. Our
                                    team will verify your documents within 48
                                    hours and notify you once your profile is
                                    live.
                                </p>
                            </div>
                            <Link
                                href={home()}
                                className="rounded bg-primary px-6 py-2 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                            >
                                Back to Home
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submitStep} noValidate>
                            {step === 0 && (
                                <SignupStep title="Personal Information">
                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="pro-full-name"
                                                className="mb-1 block text-label-sm text-on-surface-variant"
                                            >
                                                Full Name
                                            </label>
                                            <input
                                                id="pro-full-name"
                                                type="text"
                                                autoComplete="name"
                                                value={data.fullName}
                                                onChange={(event) =>
                                                    setField(
                                                        'fullName',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Jean Dupont"
                                                className={cn(
                                                    inputClassName,
                                                    'rounded p-2 shadow-none',
                                                    errors.fullName &&
                                                        invalidClassName,
                                                )}
                                            />
                                            <FieldError
                                                message={errors.fullName}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="pro-location"
                                                className="mb-1 block text-label-sm text-on-surface-variant"
                                            >
                                                City / Commune
                                            </label>
                                            <input
                                                id="pro-location"
                                                type="text"
                                                value={data.location}
                                                onChange={(event) =>
                                                    setField(
                                                        'location',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Kinshasa, Gombe"
                                                className={cn(
                                                    inputClassName,
                                                    'rounded p-2 shadow-none',
                                                    errors.location &&
                                                        invalidClassName,
                                                )}
                                            />
                                            <FieldError
                                                message={errors.location}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <span className="mb-2 block text-label-sm text-on-surface-variant">
                                            Profile Photo
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-variant text-outline">
                                                {profilePhotoUrl ? (
                                                    <img
                                                        src={profilePhotoUrl}
                                                        alt="Profile preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <MaterialSymbol
                                                        name="person"
                                                        className="text-4xl"
                                                    />
                                                )}
                                            </div>
                                            <input
                                                ref={profilePhotoInput}
                                                type="file"
                                                accept="image/*"
                                                onChange={selectFile(
                                                    'profilePhoto',
                                                )}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    profilePhotoInput.current?.click()
                                                }
                                                className="rounded border border-primary px-4 py-2 text-label-md text-primary transition-colors hover:bg-surface-container"
                                            >
                                                {data.profilePhoto
                                                    ? 'Change Photo'
                                                    : 'Upload Photo'}
                                            </button>
                                        </div>
                                    </div>
                                </SignupStep>
                            )}

                            {step === 1 && (
                                <SignupStep title="Trade & Experience">
                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="pro-trade"
                                                className="mb-1 block text-label-sm text-on-surface-variant"
                                            >
                                                Trade / Métier
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="pro-trade"
                                                    value={data.trade}
                                                    onChange={(event) =>
                                                        setField(
                                                            'trade',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={cn(
                                                        selectClassName,
                                                        'rounded p-2 pr-9 shadow-none',
                                                        errors.trade &&
                                                            invalidClassName,
                                                    )}
                                                >
                                                    <option value="">
                                                        Select your trade
                                                    </option>
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.slug
                                                                }
                                                                value={
                                                                    category.slug
                                                                }
                                                            >
                                                                {category.name}{' '}
                                                                /{' '}
                                                                {
                                                                    category.nameFr
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <MaterialSymbol
                                                    name="expand_more"
                                                    className="pointer-events-none absolute top-2 right-2 text-outline"
                                                />
                                            </div>
                                            <FieldError
                                                message={errors.trade}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="pro-experience"
                                                className="mb-1 block text-label-sm text-on-surface-variant"
                                            >
                                                Years of Experience
                                            </label>
                                            <input
                                                id="pro-experience"
                                                type="number"
                                                min={0}
                                                max={60}
                                                value={data.experienceYears}
                                                onChange={(event) =>
                                                    setField(
                                                        'experienceYears',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="e.g. 8"
                                                className={cn(
                                                    inputClassName,
                                                    'rounded p-2 shadow-none',
                                                    errors.experienceYears &&
                                                        invalidClassName,
                                                )}
                                            />
                                            <FieldError
                                                message={errors.experienceYears}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label
                                            htmlFor="pro-bio"
                                            className="mb-1 block text-label-sm text-on-surface-variant"
                                        >
                                            About Your Services (Optional)
                                        </label>
                                        <textarea
                                            id="pro-bio"
                                            rows={4}
                                            value={data.bio}
                                            onChange={(event) =>
                                                setField(
                                                    'bio',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Describe your specialties, certifications and the areas you cover..."
                                            className={cn(
                                                inputClassName,
                                                'resize-none rounded p-2 shadow-none',
                                            )}
                                        />
                                    </div>
                                </SignupStep>
                            )}

                            {step === 2 && (
                                <SignupStep title="Verification Documents">
                                    <p className="-mt-3 mb-6 text-body-md text-on-surface-variant">
                                        Verified pros get up to 3x more
                                        requests. Your documents are never shown
                                        publicly.
                                    </p>
                                    <div className="mb-6 flex flex-col gap-4">
                                        <DocumentUpload
                                            label="National ID, Passport or Voter Card"
                                            file={data.identityDocument}
                                            onChange={selectFile(
                                                'identityDocument',
                                            )}
                                            error={errors.identityDocument}
                                            isRequired
                                        />
                                        <DocumentUpload
                                            label="Business Registration (RCCM) — Optional"
                                            file={data.businessRegistration}
                                            onChange={selectFile(
                                                'businessRegistration',
                                            )}
                                        />
                                    </div>
                                </SignupStep>
                            )}

                            {step === 3 && (
                                <SignupStep title="Work Gallery">
                                    <p className="-mt-3 mb-6 text-body-md text-on-surface-variant">
                                        Show clients your best work. Add up to{' '}
                                        {maxGalleryPhotos} photos (optional).
                                    </p>
                                    <input
                                        ref={galleryInput}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={addGalleryPhotos}
                                        className="hidden"
                                    />
                                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {data.gallery.map((file, index) => (
                                            <GalleryThumbnail
                                                key={`${file.name}-${file.lastModified}`}
                                                file={file}
                                                onRemove={() =>
                                                    setField(
                                                        'gallery',
                                                        data.gallery.filter(
                                                            (_, position) =>
                                                                position !==
                                                                index,
                                                        ),
                                                    )
                                                }
                                            />
                                        ))}
                                        {data.gallery.length <
                                            maxGalleryPhotos && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    galleryInput.current?.click()
                                                }
                                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container"
                                            >
                                                <MaterialSymbol
                                                    name="add_photo_alternate"
                                                    className="text-3xl text-primary"
                                                />
                                                <span className="text-label-sm">
                                                    Add Photo
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </SignupStep>
                            )}

                            <div
                                className={cn(
                                    'mt-8 flex',
                                    step > 0
                                        ? 'justify-between'
                                        : 'justify-end',
                                )}
                            >
                                {step > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        className="rounded border border-outline px-6 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-variant"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded bg-primary px-6 py-2 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                                >
                                    {step === signupSteps.length - 2
                                        ? 'Submit Application'
                                        : 'Next'}
                                    <MaterialSymbol
                                        name="arrow_forward"
                                        className="text-[18px]"
                                    />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

function SignupStep({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div>
            <h2 className="mb-6 text-headline-md text-on-surface">{title}</h2>
            {children}
        </div>
    );
}

type DocumentUploadProps = {
    label: string;
    file: File | null;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    isRequired?: boolean;
};

function DocumentUpload({
    label,
    file,
    onChange,
    error,
    isRequired = false,
}: DocumentUploadProps) {
    return (
        <div>
            <label
                className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 transition-colors hover:bg-surface-container-low',
                    error ? 'border-error' : 'border-outline-variant',
                )}
            >
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={onChange}
                    className="sr-only"
                />
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MaterialSymbol
                        name={file ? 'task' : 'upload_file'}
                        filled={Boolean(file)}
                    />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-label-md text-on-surface">
                        {label}
                        {isRequired && <span className="text-error"> *</span>}
                    </span>
                    <span className="block truncate text-label-sm text-on-surface-variant">
                        {file ? file.name : 'PDF, JPG or PNG up to 10MB'}
                    </span>
                </span>
                <span className="text-label-md text-primary">
                    {file ? 'Replace' : 'Browse'}
                </span>
            </label>
            <div className="mt-1">
                <FieldError message={error} />
            </div>
        </div>
    );
}

function GalleryThumbnail({
    file,
    onRemove,
}: {
    file: File;
    onRemove: () => void;
}) {
    const previewUrl = usePreviewUrl(file);

    return (
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-surface-variant">
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-full w-full object-cover"
                />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-primary/40 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${file.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-error shadow-md"
                >
                    <MaterialSymbol name="delete" className="text-sm" />
                </button>
            </div>
        </div>
    );
}

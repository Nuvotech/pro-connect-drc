import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import StarRating from '@/components/directory/star-rating';
import {
    businessCategories,
    categories,
    findProfessional,
    topRatedProfessionalSlugs,
} from '@/lib/directory-data';
import { search, serviceRequest } from '@/routes';
import { show as showCategory } from '@/routes/categories';
import { show as showProfessional } from '@/routes/professionals';
import type { Professional } from '@/types';

const howItWorksSteps = [
    {
        title: 'Complete Form',
        description: 'Tell us what you need done and where.',
    },
    {
        title: 'Identify Pros',
        description: 'We match you with local, qualified professionals.',
    },
    {
        title: 'Assessment Visit',
        description: 'Pros visit your site if necessary to assess the work.',
    },
    {
        title: 'Compare Quotes',
        description: 'Review estimates and choose the best fit.',
    },
];

const benefits = [
    {
        icon: 'verified',
        title: 'Verified Pros',
        description:
            'Every professional is vetted for quality and reliability.',
    },
    {
        icon: 'map',
        title: 'Local Coverage',
        description: 'Find pros near you across major cities in the DRC.',
    },
    {
        icon: 'request_quote',
        title: 'Free Quotes',
        description: 'Get multiple estimates without any upfront costs.',
    },
    {
        icon: 'rate_review',
        title: 'Transparent Reviews',
        description: 'Read genuine feedback from previous customers.',
    },
];

const topRatedProfessionals = topRatedProfessionalSlugs
    .map((slug) => findProfessional(slug))
    .filter((professional): professional is Professional =>
        Boolean(professional),
    );

export default function Home() {
    const { openQuoteRequest } = useQuoteRequest();
    const [service, setService] = useState('');
    const [location, setLocation] = useState('');

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.visit(
            search.url({
                query: {
                    q: service || undefined,
                    location: location || undefined,
                },
            }),
        );
    }

    return (
        <>
            <Head title="Find Reliable Professionals in DRC" />

            <section className="relative grid w-full grid-cols-1 items-center gap-10 overflow-hidden bg-surface-container-low px-page py-16 md:grid-cols-2 md:py-24">
                <div className="relative z-10">
                    <h1 className="mb-6 text-headline-lg leading-tight text-on-background md:text-display-lg">
                        Find Reliable Professionals in{' '}
                        <span className="text-primary">DRC</span>
                    </h1>
                    <p className="mb-10 max-w-lg text-body-lg text-on-surface-variant">
                        Connect with trusted tradespeople for your home or
                        business projects. Verified, local, and ready to help.
                    </p>
                    <form
                        onSubmit={submitSearch}
                        className="flex max-w-2xl flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-lg md:flex-row"
                    >
                        <div className="relative flex-1">
                            <label
                                htmlFor="hero-service"
                                className="mb-1 block pl-2 text-label-sm text-on-surface-variant"
                            >
                                What do you need?
                            </label>
                            <div className="relative flex items-center rounded-lg border border-outline-variant transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                <MaterialSymbol
                                    name="handyman"
                                    className="ml-4 text-outline"
                                />
                                <input
                                    id="hero-service"
                                    type="text"
                                    value={service}
                                    onChange={(event) =>
                                        setService(event.target.value)
                                    }
                                    placeholder="e.g. Plumber, Electrician..."
                                    className="w-full border-none bg-transparent px-4 py-2 text-body-md outline-none"
                                />
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <label
                                htmlFor="hero-location"
                                className="mb-1 block pl-2 text-label-sm text-on-surface-variant"
                            >
                                Location
                            </label>
                            <div className="relative flex items-center rounded-lg border border-outline-variant transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                <MaterialSymbol
                                    name="location_on"
                                    className="ml-4 text-outline"
                                />
                                <input
                                    id="hero-location"
                                    type="text"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    placeholder="e.g. Kinshasa, Gombe"
                                    className="w-full border-none bg-transparent px-4 py-2 text-body-md outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-label-md text-on-primary transition-opacity hover:opacity-90 md:mt-6"
                        >
                            Search
                            <MaterialSymbol
                                name="arrow_forward"
                                className="text-sm"
                            />
                        </button>
                    </form>
                </div>
                <div className="relative z-10 hidden md:block">
                    <div className="relative ml-auto max-w-sm rounded-xl border border-outline-variant bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <div className="absolute -top-4 -left-4 flex rounded-full bg-secondary-container p-2 text-on-secondary-container shadow-md">
                            <MaterialSymbol name="format_quote" />
                        </div>
                        <h3 className="mb-2 text-headline-md text-on-background">
                            Ready to start?
                        </h3>
                        <p className="mb-6 text-body-md text-on-surface-variant">
                            Choose from the best and highest-rated professionals
                            in your area. Get matched with top-tier local
                            experts today.
                        </p>
                        <button
                            type="button"
                            onClick={() => openQuoteRequest()}
                            className="w-full rounded-lg bg-secondary-container py-4 text-label-md font-bold text-on-secondary-container transition-all hover:brightness-105"
                        >
                            Find Top-Rated Professionals
                        </button>
                        <p className="mt-4 text-center text-label-sm text-outline">
                            No obligation, 100% free.
                        </p>
                    </div>
                    <img
                        src="/images/directory/hero-handyman.jpg"
                        alt=""
                        className="absolute top-1/2 right-0 -z-10 h-3/4 w-3/4 -translate-y-1/2 rounded-2xl object-cover opacity-60 mix-blend-multiply"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => openQuoteRequest()}
                    className="w-full rounded-lg bg-secondary-container py-4 text-label-md font-bold text-on-secondary-container transition-all hover:brightness-105 md:hidden"
                >
                    Get Free Quotes
                </button>
            </section>

            <section
                id="categories"
                className="w-full scroll-mt-20 bg-background px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        Browse by Category
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        Explore our wide range of professional services tailored
                        to your needs in the DRC.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={showCategory(category.slug)}
                            className="group flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-4 flex rounded-full bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                                <MaterialSymbol
                                    name={category.icon}
                                    className="text-3xl"
                                />
                            </div>
                            <h3 className="mb-2 text-headline-md text-on-background">
                                {category.name}
                            </h3>
                            <p className="mb-2 text-label-sm text-on-surface-variant">
                                {category.nameFr}
                            </p>
                            <p className="text-label-sm font-semibold text-primary">
                                {category.prosCount}+ Pros
                            </p>
                        </Link>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href={search()}
                        className="inline-block rounded-lg border border-primary bg-surface px-10 py-4 text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
                    >
                        View All Categories
                    </Link>
                </div>
            </section>

            <section
                id="business-services"
                className="w-full scroll-mt-20 bg-surface-container-low px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        Services aux Entreprises &amp; Professionnels / B2B
                        &amp; Professional Services
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        Solutions spécialisées pour la croissance et la
                        conformité de votre entreprise en RDC.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {businessCategories.map((category) => (
                        <Link
                            key={category.slug}
                            href={serviceRequest({
                                query: { category: category.slug },
                            })}
                            className="group flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="mb-4 flex rounded-full bg-secondary-container/20 p-4 text-secondary-container transition-colors group-hover:bg-secondary-container group-hover:text-on-secondary-container">
                                <MaterialSymbol
                                    name={category.icon}
                                    className="text-3xl"
                                />
                            </div>
                            <h3 className="mb-2 text-headline-md text-on-background">
                                {category.name}
                            </h3>
                            <p className="mb-2 text-label-sm text-on-surface-variant">
                                {category.nameFr}
                            </p>
                            <p className="text-body-md text-on-surface-variant">
                                {category.summary}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section
                id="how-it-works"
                className="w-full scroll-mt-20 bg-surface-container-low px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        How It Works
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        Get your project done in 4 simple steps.
                    </p>
                </div>
                <div className="relative isolate grid grid-cols-1 gap-10 md:grid-cols-4">
                    <div className="absolute top-8 right-[12.5%] left-[12.5%] -z-10 hidden h-0.5 bg-outline-variant md:block" />
                    {howItWorksSteps.map((step, index) => (
                        <div
                            key={step.title}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-headline-lg font-bold text-on-secondary-container shadow-md">
                                {index + 1}
                            </div>
                            <h3 className="mb-2 text-headline-md text-on-background">
                                {step.title}
                            </h3>
                            <p className="text-body-md text-on-surface-variant">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-16 text-center">
                    <button
                        type="button"
                        onClick={() => openQuoteRequest()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-4 text-label-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
                    >
                        Get Free Quotes
                        <MaterialSymbol
                            name="arrow_forward"
                            className="text-sm"
                        />
                    </button>
                </div>
            </section>

            <section className="w-full bg-background px-page py-16">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        Why Choose Us
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        We take the stress out of finding reliable help.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => (
                        <div
                            key={benefit.title}
                            className="rounded-xl border border-outline-variant bg-surface p-10 shadow-sm"
                        >
                            <MaterialSymbol
                                name={benefit.icon}
                                className="mb-4 text-4xl text-primary"
                            />
                            <h3 className="mb-2 text-headline-md text-on-background">
                                {benefit.title}
                            </h3>
                            <p className="text-body-md text-on-surface-variant">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="w-full bg-surface-container-low px-page py-16">
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                            Top Rated Professionals
                        </h2>
                        <p className="max-w-2xl text-body-lg text-on-surface-variant">
                            Meet some of our highly recommended experts.
                        </p>
                    </div>
                    <Link
                        href={search()}
                        className="hidden items-center gap-2 text-label-md text-primary hover:underline md:flex"
                    >
                        See All
                        <MaterialSymbol
                            name="arrow_forward"
                            className="text-sm"
                        />
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {topRatedProfessionals.map((professional) => (
                        <Link
                            key={professional.slug}
                            href={showProfessional(professional.slug)}
                            className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <img
                                src={professional.photo}
                                alt={professional.name}
                                className="mb-4 h-24 w-24 rounded-full border-2 border-primary object-cover"
                            />
                            <h3 className="mb-2 text-headline-md text-on-background">
                                {professional.name}
                            </h3>
                            <p className="mb-2 text-label-sm text-primary">
                                {professional.title}
                            </p>
                            <div className="mb-4 flex items-center">
                                <StarRating rating={professional.rating} />
                                <span className="ml-2 text-label-sm text-on-surface-variant">
                                    ({professional.reviewsCount} reviews)
                                </span>
                            </div>
                            <p className="line-clamp-2 text-body-md text-on-surface-variant">
                                {professional.summary}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}

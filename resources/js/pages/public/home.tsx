import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import type { FormEvent } from "react";
import MaterialSymbol from "@/components/directory/material-symbol";
import { useQuoteRequest } from "@/components/directory/quote-request/quote-request-provider";
import ServiceMarquee from "@/components/directory/service-marquee";
import StarRating from "@/components/directory/star-rating";
import { useCities } from "@/hooks/use-categories";
import { useVisitorLocation } from "@/hooks/use-visitor-location";
import { search, serviceRequest } from "@/routes";
import {
    index as categoriesIndex,
    show as showCategory,
} from "@/routes/categories";
import { show as showProfessional } from "@/routes/professionals";
import { index as vehiclesIndex } from "@/routes/vehicles";
import type {
    BusinessCategory,
    Category,
    Professional,
    VehicleRentalCategory,
} from "@/types";
import { otherName, t } from "@/lib/i18n";

const howItWorksSteps = [
    {
        title: "Complete Form",
        description: "Tell us what you need done and where.",
    },
    {
        title: "Identify Pros",
        description: "We match you with local, qualified professionals.",
    },
    {
        title: "Assessment Visit",
        description: "Pros visit your site if necessary to assess the work.",
    },
    {
        title: "Compare Quotes",
        description: "Review estimates and choose the best fit.",
    },
];

const benefits = [
    {
        icon: "verified",
        title: "Verified Pros",
        description:
            "Every professional is vetted for quality and reliability.",
    },
    {
        icon: "map",
        title: "Local Coverage",
        description: "Find pros near you across major cities in the DRC.",
    },
    {
        icon: "request_quote",
        title: "Free Quotes",
        description: "Get multiple estimates without any upfront costs.",
    },
    {
        icon: "rate_review",
        title: "Transparent Reviews",
        description: "Read genuine feedback from previous customers.",
    },
];

export default function Home({
    categories,
    businessCategories,
    vehicleCategories,
    topRatedProfessionals,
    heroCategories,
}: {
    categories: Category[];
    heroCategories: Category[];
    businessCategories: BusinessCategory[];
    vehicleCategories: VehicleRentalCategory[];
    topRatedProfessionals: Professional[];
}) {
    const { openQuoteRequest } = useQuoteRequest();
    const { cities } = useCities();
    const [service, setService] = useState("");
    const { city: visitorCity } = useVisitorLocation();
    const [chosenLocation, setLocation] = useState<string | null>(null);
    const location = chosenLocation ?? visitorCity?.name ?? "";

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
            <Head title={t("Find Reliable Professionals in DRC")} />

            <section className="relative grid w-full grid-cols-1 items-center gap-10 overflow-hidden bg-surface-container-low px-page py-16 md:grid-cols-2 md:py-24">
                <div className="relative z-10">
                    <h1 className="mb-6 text-headline-lg leading-tight text-on-background md:text-display-lg">
                        {t("Find Reliable Professionals in")}{" "}
                        <span className="text-secondary-container">
                            {t("DRC")}
                        </span>
                    </h1>
                    <p className="mb-10 max-w-lg text-body-lg text-on-surface-variant">
                        {t(
                            "Connect with trusted tradespeople for your home or business projects. Verified, local, and ready to help.",
                        )}
                    </p>
                    <form
                        onSubmit={submitSearch}
                        className="flex max-w-2xl flex-col gap-4 rounded-xl border border-outline-variant bg-surface p-4 shadow-lg md:flex-row md:items-end"
                    >
                        <div className="relative flex-1">
                            <label
                                htmlFor="hero-service"
                                className="mb-1 block pl-2 text-label-sm text-on-surface-variant"
                            >
                                {t("What do you need?")}
                            </label>
                            <div className="relative flex h-12 items-center rounded-lg border border-outline-variant transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
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
                                    placeholder={t(
                                        "e.g. Plumber, Electrician...",
                                    )}
                                    className="w-full border-none bg-transparent px-4 py-2 text-body-md outline-none"
                                />
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <label
                                htmlFor="hero-location"
                                className="mb-1 block pl-2 text-label-sm text-on-surface-variant"
                            >
                                {t("Location")}
                            </label>
                            <div className="relative flex h-12 items-center rounded-lg border border-outline-variant transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                                <MaterialSymbol
                                    name="location_on"
                                    className="ml-4 text-outline"
                                />
                                <select
                                    id="hero-location"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    className="w-full cursor-pointer appearance-none border-none bg-transparent px-4 py-2 text-body-md outline-none"
                                >
                                    <option value="">{t("All cities")}</option>
                                    {cities.map((city) => (
                                        <option
                                            key={city.name}
                                            value={city.name}
                                        >
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity hover:opacity-90"
                        >
                            {t("Search")}
                            <MaterialSymbol
                                name="arrow_forward"
                                className="text-sm"
                            />
                        </button>
                    </form>
                </div>
                <div className="relative z-10 hidden min-w-0 md:block">
                    <ServiceMarquee categories={heroCategories} />
                </div>
                <button
                    type="button"
                    onClick={() => openQuoteRequest()}
                    className="w-full rounded-lg bg-secondary-container py-4 text-label-md font-bold text-on-secondary-container transition-all hover:brightness-105 md:hidden"
                >
                    {t("Get Free Quotes")}
                </button>
            </section>

            <section
                id="categories"
                className="w-full scroll-mt-20 bg-background px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        {t("Browse by Category")}
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        {t(
                            "Explore our wide range of professional services tailored to your needs in the DRC.",
                        )}
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
                                {otherName(category)}
                            </p>
                            <p className="text-label-sm font-semibold text-primary">
                                {category.prosCount === 0
                                    ? t("Join as a pro")
                                    : `${category.prosCount} verified ${category.prosCount === 1 ? "pro" : "pros"}`}
                            </p>
                        </Link>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href={categoriesIndex()}
                        className="inline-block rounded-lg border border-primary bg-surface px-10 py-4 text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
                    >
                        {t("View all services")}
                    </Link>
                </div>
            </section>

            <section
                id="business-services"
                className="w-full scroll-mt-20 bg-surface-container-low px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        {t("B2B & Professional Services")}
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        {t(
                            "Specialised solutions to grow your business and stay compliant in the DRC.",
                        )}
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
                                {otherName(category)}
                            </p>
                            <p className="text-body-md text-on-surface-variant">
                                {category.summary}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section
                id="vehicle-rental"
                className="w-full scroll-mt-20 bg-background px-page py-16"
            >
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        {t("Service Vehicle & Equipment Rental")}
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        {t(
                            "Commercial trucks, fleet hire, passenger transport, and utility vehicles across DRC.",
                        )}
                    </p>
                </div>
                <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-outline-variant/60">
                    <ul className="grid grid-cols-1 gap-px bg-outline-variant/60 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicleCategories.map((vehicleCategory) => (
                            <li
                                key={vehicleCategory.slug}
                                className="bg-surface"
                            >
                                <Link
                                    href={vehiclesIndex({
                                        query: {
                                            types: [vehicleCategory.slug],
                                        },
                                    })}
                                    className="group flex h-full flex-col gap-4 p-8 transition-colors duration-200 hover:bg-surface-container-low focus-visible:bg-surface-container-low focus-visible:outline-none"
                                >
                                    <MaterialSymbol
                                        name={vehicleCategory.icon}
                                        className="text-[28px] text-primary"
                                    />
                                    <div className="flex flex-1 flex-col gap-1.5">
                                        <h3 className="text-lg font-semibold text-on-background">
                                            {vehicleCategory.name}
                                        </h3>
                                        <p className="text-body-md text-on-surface-variant">
                                            {vehicleCategory.summary}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant transition-colors duration-200 group-hover:text-primary">
                                        {t("View vehicles")}
                                        <MaterialSymbol
                                            name="arrow_forward"
                                            className="text-sm transition-transform duration-200 group-hover:translate-x-0.5"
                                        />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href={vehiclesIndex()}
                        className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        {t("Browse the full fleet")}
                        <MaterialSymbol
                            name="arrow_forward"
                            className="text-base"
                        />
                    </Link>
                </div>
            </section>

            <section
                id="how-it-works"
                className="w-full scroll-mt-20 bg-surface-container-low px-page py-16"
            >
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                        {t("How It Works")}
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        {t("Get your project done in 4 simple steps.")}
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
                                {t(step.title)}
                            </h3>
                            <p className="text-body-md text-on-surface-variant">
                                {t(step.description)}
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
                        {t("Get Free Quotes")}
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
                        {t("Why Choose Us")}
                    </h2>
                    <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                        {t("We take the stress out of finding reliable help.")}
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
                                {t(benefit.title)}
                            </h3>
                            <p className="text-body-md text-on-surface-variant">
                                {t(benefit.description)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {topRatedProfessionals.length > 0 && (
                <section className="w-full bg-surface-container-low px-page py-16">
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            <h2 className="mb-4 text-headline-lg font-bold text-on-background">
                                {t("Top Rated Professionals")}
                            </h2>
                            <p className="max-w-2xl text-body-lg text-on-surface-variant">
                                {t(
                                    "Meet some of our highly recommended experts.",
                                )}
                            </p>
                        </div>
                        <Link
                            href={search()}
                            className="hidden items-center gap-2 text-label-md text-primary hover:underline md:flex"
                        >
                            {t("See All")}
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
                                    loading="lazy"
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
                                        ({professional.reviewsCount}{" "}
                                        {t("reviews)")}
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-body-md text-on-surface-variant">
                                    {professional.summary}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

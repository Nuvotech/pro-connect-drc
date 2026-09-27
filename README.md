# ProConnect RDC

A classifieds-style directory that connects people and businesses in the Democratic Republic of Congo with verified local professionals, from plumbers and electricians to law firms and accountants. Visitors browse by category, compare profiles and request free quotes; professionals sign up to receive requests.

> **Status:** the public-facing UI is built from the Google Stitch designs. It is **frontend only** for now: listings come from placeholder data and forms validate in the browser but do not submit anywhere yet.

## Tech stack

- **Backend:** Laravel 13, PHP 8.3+, Fortify (auth), SQLite by default
- **Frontend:** Inertia v3 + React 19, TypeScript, Tailwind CSS v4, Radix UI
- **Routing helpers:** Wayfinder (typed route functions in `@/routes` and `@/actions`)
- **Tooling:** Vite (via `vite-plus`), Pest, Pint, Larastan

## Getting started

Requirements: PHP 8.3+, Composer, Node 22+ and npm. The project is set up to run on [Laravel Herd](https://herd.laravel.com) at `http://pro-connect-drc.test`.

```bash
composer run setup   # install dependencies, create .env, generate key, migrate, build assets
composer run dev     # start the app server, queue worker and Vite together
```

If you use Herd, you only need `npm run dev` for hot reloading. If UI changes don't appear, run `npm run dev` or `npm run build`.

## Public pages

| Page | URL | Component |
|---|---|---|
| Home | `/` | `pages/public/home.tsx` |
| Search results | `/search?q=&location=` | `pages/public/search.tsx` |
| Category | `/categories/{category}` | `pages/public/category.tsx` |
| Professional profile | `/pros/{professional}` | `pages/public/professional.tsx` |
| Become a Pro sign-up | `/become-a-pro` | `pages/public/become-a-pro.tsx` |
| B2B service request | `/business-services/request?category=` | `pages/public/service-request.tsx` |

**Get a Quote** is a four-step modal (Category → Project Details → Location & Site Visit → Contact) rather than a page. Any public page can open it through the `useQuoteRequest()` hook, optionally pre-filled with a category or a professional:

```tsx
const { openQuoteRequest } = useQuoteRequest();

openQuoteRequest({ categorySlug: 'plumbers' });
openQuoteRequest({ professional });
```

The auth pages, dashboard and settings from the Laravel React starter kit are unchanged.

## Where things live

```
resources/js/
├── pages/public/               Public directory pages
├── layouts/public-layout.tsx   Header + footer + quote modal provider
├── layouts/public-focus-layout.tsx   Brand-and-close layout for linear flows
├── components/directory/       Header, footer, cards, icons, form helpers
│   └── quote-request/          Get a Quote modal, its steps and validation
├── hooks/use-active-section.ts Highlights nav links while scrolling the home page
└── lib/directory-data.ts       Placeholder categories, cities and professionals

app/Http/Controllers/DirectoryController.php   Passes slugs to the category and profile pages
public/images/directory/                       Images exported from Stitch
```

## Design system

The public pages use the ProConnect design tokens from Google Stitch, defined in `resources/css/app.css`:

- **Colours:** Material-style tokens such as `bg-primary-container`, `text-on-surface-variant` and `bg-secondary-container`. `primary`, `secondary` and `background` share names with the starter kit's shadcn tokens, so they are only overridden inside the `.proconnect` wrapper and do not affect the dashboard.
- **Type scale:** `text-display-lg`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-md` and `text-label-sm`, set in Inter.
- **Page width:** use `px-page` on full-width sections. It keeps content within `--container-page` (1140px) while backgrounds stay edge to edge.
- **Icons:** Material Symbols via `<MaterialSymbol name="plumbing" filled />`.

Stitch's named spacing (`p-sm`, `gap-md`, …) is written with Tailwind's numeric scale instead (`sm` = 4, `md` = 6, `lg` = 10, `xl` = 16), because named spacing tokens would change `max-w-sm`, `max-w-lg` and similar across the app.

## Testing and code quality

```bash
php artisan test --compact     # run the test suite
vendor/bin/pint                # format PHP
npm run check                  # lint and format the frontend
npm run types:check            # TypeScript type check
composer run ci:check          # everything CI runs
```

## Next steps

- Replace `lib/directory-data.ts` with real models and pass listings as Inertia props
- Persist quote requests, B2B service requests and professional sign-ups
- Wire up the FR / EN language toggle, reviews, and the About, Contact, Privacy and Terms pages

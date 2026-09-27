import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Register the custom font-size tokens from app.css so they are not
 * mistaken for text colors (and dropped) when merged with one.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                'display-lg',
                'headline-lg',
                'headline-lg-mobile',
                'headline-md',
                'body-lg',
                'body-md',
                'label-md',
                'label-sm',
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

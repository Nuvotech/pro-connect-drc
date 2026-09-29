import { Link } from '@inertiajs/react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { cn } from '@/lib/utils';
import { show as showCategory } from '@/routes/categories';
import type { Category } from '@/types';
import { otherName, t } from '@/lib/i18n';

/**
 * Seconds for each column to scroll through its list once. Different
 * speeds keep neighbouring columns from lining up.
 */
const columnDurations = [38, 48, 42];

/**
 * Split the services round-robin into columns.
 */
function toColumns(categories: Category[], count: number): Category[][] {
    const columns: Category[][] = Array.from({ length: count }, () => []);

    categories.forEach((category, index) => {
        columns[index % count].push(category);
    });

    return columns;
}

/**
 * Columns of service cards that scroll slowly and endlessly in opposite
 * directions, clipped to their container with soft top and bottom fades.
 * Hovering or focusing a card pauses them; reduced motion stops them.
 */
export default function ServiceMarquee({
    categories,
}: {
    categories: Category[];
}) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <section
            aria-label={t('Popular services')}
            className="group relative h-[26rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
        >
            <MarqueeColumns
                categories={categories}
                count={2}
                className="grid-cols-2 xl:hidden"
            />
            <MarqueeColumns
                categories={categories}
                count={3}
                className="hidden grid-cols-3 xl:grid"
            />
        </section>
    );
}

function MarqueeColumns({
    categories,
    count,
    className,
}: {
    categories: Category[];
    count: number;
    className: string;
}) {
    return (
        <div className={cn('grid h-full gap-2.5', className)}>
            {toColumns(categories, count).map((column, index) => (
                <div key={index} className="min-w-0 overflow-hidden">
                    <div
                        className="flex animate-marquee-up flex-col group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
                        style={{
                            animationDuration: `${columnDurations[index % columnDurations.length]}s`,
                            animationDirection:
                                index % 2 === 1 ? 'reverse' : 'normal',
                        }}
                    >
                        <CardList categories={column} />
                        <CardList categories={column} isCopy />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * One pass of a column's cards. The copy that makes the loop seamless is
 * hidden from screen readers and skipped by the Tab key.
 */
function CardList({
    categories,
    isCopy = false,
}: {
    categories: Category[];
    isCopy?: boolean;
}) {
    return (
        <ul
            aria-hidden={isCopy || undefined}
            className="flex flex-col gap-2 pb-2"
        >
            {categories.map((category) => (
                <li key={category.slug}>
                    <Link
                        href={showCategory(category.slug)}
                        tabIndex={isCopy ? -1 : undefined}
                        className="group/card flex items-center gap-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 transition-colors duration-200 hover:border-primary hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                        <MaterialSymbol
                            name={category.icon}
                            className="shrink-0 text-[20px] text-primary"
                        />
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] leading-[18px] font-semibold text-on-surface">
                                {category.name}
                            </span>
                            <span className="block truncate text-[11px] leading-4 font-medium text-on-surface-variant">
                                {otherName(category)}
                                {category.prosCount > 0 &&
                                    ` · ${category.prosCount} verified`}
                            </span>
                        </span>
                        <MaterialSymbol
                            name="chevron_right"
                            className="shrink-0 text-[20px] text-outline transition-colors group-hover/card:text-primary"
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

import MaterialSymbol from '@/components/directory/material-symbol';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

type StarRatingProps = {
    rating: number;
    className?: string;
    starClassName?: string;
};

export default function StarRating({
    rating,
    className,
    starClassName = 'text-lg',
}: StarRatingProps) {
    return (
        <span
            className={cn(
                'flex items-center text-secondary-container',
                className,
            )}
            aria-label={t(':rating out of 5 stars', { rating })}
        >
            {[1, 2, 3, 4, 5].map((position) => {
                if (rating >= position) {
                    return (
                        <MaterialSymbol
                            key={position}
                            name="star"
                            filled
                            className={starClassName}
                        />
                    );
                }

                if (rating >= position - 0.5) {
                    return (
                        <MaterialSymbol
                            key={position}
                            name="star_half"
                            filled
                            className={starClassName}
                        />
                    );
                }

                return (
                    <MaterialSymbol
                        key={position}
                        name="star"
                        filled
                        className={cn(starClassName, 'text-outline-variant')}
                    />
                );
            })}
        </span>
    );
}

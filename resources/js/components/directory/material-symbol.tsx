import { cn } from '@/lib/utils';

type MaterialSymbolProps = {
    name: string;
    filled?: boolean;
    className?: string;
};

export default function MaterialSymbol({
    name,
    filled = false,
    className,
}: MaterialSymbolProps) {
    return (
        <span
            aria-hidden="true"
            data-filled={filled ? 'true' : undefined}
            className={cn('material-symbol', className)}
        >
            {name}
        </span>
    );
}

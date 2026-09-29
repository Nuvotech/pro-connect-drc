import { CircleCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentTone } from '@/types';

export default function DocumentStatus({
    label,
    tone,
}: {
    label: string;
    tone: DocumentTone;
}) {
    const Icon = tone === 'verified' ? CircleCheck : Clock;

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1 text-xs font-medium',
                tone === 'verified' ? 'text-primary' : 'text-zinc-500',
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
        </span>
    );
}

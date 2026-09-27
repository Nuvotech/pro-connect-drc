import MaterialSymbol from '@/components/directory/material-symbol';

export default function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p
            role="alert"
            className="flex items-center gap-1 text-label-sm text-error"
        >
            <MaterialSymbol name="error" className="text-base" />
            {message}
        </p>
    );
}

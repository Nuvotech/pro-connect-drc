import { Form, Head, Link } from '@inertiajs/react';
import CustomerAccountController from '@/actions/App/Http/Controllers/CustomerAccountController';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { t } from '@/lib/i18n';

const fields = [
    {
        name: 'full_name',
        label: 'Full name',
        type: 'text',
        autoComplete: 'name',
        placeholder: 'e.g. Patrick Mukendi',
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        autoComplete: 'email',
        placeholder: 'you@example.com',
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
        placeholder: '',
    },
    {
        name: 'password_confirmation',
        label: 'Confirm password',
        type: 'password',
        autoComplete: 'new-password',
        placeholder: '',
    },
] as const;

export default function RegisterCustomer() {
    return (
        <>
            <Head title={t('Create your account')} />

            <Form
                {...CustomerAccountController.store.form()}
                resetOnError={['password', 'password_confirmation']}
                className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="mb-1">
                            <h1 className="text-headline-md text-on-surface">
                                {t('Create your account')}
                            </h1>
                            <p className="mt-1 text-body-md text-on-surface-variant">
                                {t(
                                    'Follow your requests and review the pros you hired. Use the email you gave on your requests.',
                                )}
                            </p>
                        </div>

                        {fields.slice(0, 2).map((field) => (
                            <TextField
                                key={field.name}
                                {...field}
                                error={errors[field.name]}
                            />
                        ))}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="phone"
                                className="text-label-md text-on-surface"
                            >
                                {t('Phone number')}
                            </label>
                            <div
                                className={cn(
                                    'flex h-11 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
                                    errors.phone && 'border-error',
                                )}
                            >
                                <span className="flex shrink-0 items-center border-r border-outline-variant bg-surface-container-low px-3 text-label-md text-on-surface select-none">
                                    +243
                                </span>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel-national"
                                    placeholder="81 234 5678"
                                    aria-invalid={Boolean(errors.phone)}
                                    className="w-full min-w-0 bg-transparent px-3 text-body-md text-on-surface outline-none placeholder:text-outline"
                                />
                            </div>
                            <FieldError message={errors.phone} />
                        </div>

                        {fields.slice(2).map((field) => (
                            <TextField
                                key={field.name}
                                {...field}
                                error={errors[field.name]}
                            />
                        ))}

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? t('Creating…') : t('Create account')}
                        </button>

                        <p className="text-center text-label-sm text-on-surface-variant">
                            {t('Already have an account?')}{' '}
                            <Link
                                href={login()}
                                className="text-primary hover:underline"
                            >
                                {t('Log in')}
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

function TextField({
    name,
    label,
    type,
    autoComplete,
    placeholder,
    error,
}: {
    name: string;
    label: string;
    type: string;
    autoComplete: string;
    placeholder: string;
    error?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-label-md text-on-surface">
                {t(label)}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                autoComplete={autoComplete}
                placeholder={placeholder ? t(placeholder) : undefined}
                aria-invalid={Boolean(error)}
                className={cn(
                    inputClassName,
                    'h-11 px-3',
                    error && invalidClassName,
                )}
            />
            <FieldError message={error} />
        </div>
    );
}

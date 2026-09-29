import { Form, Head } from '@inertiajs/react';
import {
    AuthField,
    AuthInput,
    AuthLink,
    AuthStatus,
    AuthSubmit,
} from '@/components/auth/auth-form';
import { t } from '@/lib/i18n';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title={t('Forgot password')} />

            <AuthStatus>{status}</AuthStatus>

            <Form {...email.form()} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <AuthField
                            id="email"
                            label={t('Email address')}
                            error={errors.email}
                        >
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder={t('you@example.com')}
                                aria-invalid={Boolean(errors.email)}
                            />
                        </AuthField>

                        <AuthSubmit
                            processing={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {t('Email password reset link')}
                        </AuthSubmit>
                    </>
                )}
            </Form>

            <p className="mt-6 border-t border-outline-variant pt-5 text-center text-label-md text-on-surface-variant">
                {t('Remembered it?')}{' '}
                <AuthLink href={login()}>{t('Back to log in')}</AuthLink>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot your password?',
    description:
        'Enter your email and we will send you a link to choose a new one.',
};

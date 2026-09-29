import { Form, Head } from '@inertiajs/react';
import {
    AuthField,
    AuthInput,
    AuthLink,
    AuthPasswordInput,
    AuthSubmit,
} from '@/components/auth/auth-form';
import { t } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title={t('Register')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <AuthField
                            id="name"
                            label={t('Full name')}
                            error={errors.name}
                        >
                            <AuthInput
                                id="name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                autoComplete="name"
                                aria-invalid={Boolean(errors.name)}
                            />
                        </AuthField>

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
                                autoComplete="email"
                                placeholder={t('you@example.com')}
                                aria-invalid={Boolean(errors.email)}
                            />
                        </AuthField>

                        <AuthField
                            id="password"
                            label={t('Password')}
                            error={errors.password}
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(errors.password)}
                            />
                        </AuthField>

                        <AuthField
                            id="password_confirmation"
                            label={t('Confirm password')}
                            error={errors.password_confirmation}
                        >
                            <AuthPasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                            />
                        </AuthField>

                        <AuthSubmit
                            processing={processing}
                            data-test="register-user-button"
                        >
                            {t('Create account')}
                        </AuthSubmit>
                    </>
                )}
            </Form>

            <p className="mt-6 border-t border-outline-variant pt-5 text-center text-label-md text-on-surface-variant">
                {t('Already have an account?')}{' '}
                <AuthLink href={login()}>{t('Log in')}</AuthLink>
            </p>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};

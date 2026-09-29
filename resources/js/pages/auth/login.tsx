import { Form, Head } from '@inertiajs/react';
import {
    AuthField,
    AuthInput,
    AuthLink,
    AuthPasswordInput,
    AuthStatus,
    AuthSubmit,
} from '@/components/auth/auth-form';
import PasskeyVerify from '@/components/passkey-verify';
import { t } from '@/lib/i18n';
import { becomeAPro } from '@/routes';
import { register as registerAccount } from '@/routes/account';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title={t('Log in')} />

            <AuthStatus>{status}</AuthStatus>

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
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

                        <AuthField
                            id="password"
                            label={t('Password')}
                            error={errors.password}
                            aside={
                                canResetPassword && (
                                    <AuthLink
                                        href={request()}
                                        className="text-label-sm font-medium"
                                    >
                                        {t('Forgot password?')}
                                    </AuthLink>
                                )
                            }
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                aria-invalid={Boolean(errors.password)}
                            />
                        </AuthField>

                        <label className="flex cursor-pointer items-center gap-2.5 text-label-md text-on-surface">
                            <input
                                type="checkbox"
                                name="remember"
                                className="size-4 cursor-pointer rounded accent-primary"
                            />
                            {t('Remember me')}
                        </label>

                        <AuthSubmit
                            processing={processing}
                            data-test="login-button"
                        >
                            {t('Log in')}
                        </AuthSubmit>
                    </>
                )}
            </Form>

            <div className="mt-6 flex flex-col gap-1.5 border-t border-outline-variant pt-5 text-center text-label-md text-on-surface-variant">
                <p>
                    {t('New to ProConnect?')}{' '}
                    <AuthLink href={registerAccount()}>
                        {t('Create an account')}
                    </AuthLink>
                </p>
                <p>
                    {t('Offer a service or rent out vehicles?')}{' '}
                    <AuthLink href={becomeAPro()}>
                        {t('Join as a pro')}
                    </AuthLink>
                </p>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to your ProConnect account.',
};

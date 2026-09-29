import { Form, Head } from '@inertiajs/react';
import {
    AuthField,
    AuthInput,
    AuthPasswordInput,
    AuthSubmit,
} from '@/components/auth/auth-form';
import { t } from '@/lib/i18n';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title={t('Reset password')} />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <AuthField
                            id="email"
                            label={t('Email')}
                            error={errors.email}
                        >
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                className="bg-surface-container-low text-on-surface-variant"
                            />
                        </AuthField>

                        <AuthField
                            id="password"
                            label={t('New password')}
                            error={errors.password}
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
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
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                aria-invalid={Boolean(
                                    errors.password_confirmation,
                                )}
                            />
                        </AuthField>

                        <AuthSubmit
                            processing={processing}
                            data-test="reset-password-button"
                        >
                            {t('Save password')}
                        </AuthSubmit>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Choose a new password',
    description: 'Use at least 8 characters.',
};

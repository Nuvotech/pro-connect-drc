import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import {
    AuthField,
    AuthPasswordInput,
    AuthSubmit,
} from '@/components/auth/auth-form';
import PasskeyVerify from '@/components/passkey-verify';
import { t } from '@/lib/i18n';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title={t('Confirm password')} />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label={t('Confirm with passkey')}
                loadingLabel={t('Confirming…')}
                separator={t('Or confirm with your password')}
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <AuthField
                            id="password"
                            label={t('Password')}
                            error={errors.password}
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                autoFocus
                                aria-invalid={Boolean(errors.password)}
                            />
                        </AuthField>

                        <AuthSubmit
                            processing={processing}
                            data-test="confirm-password-button"
                        >
                            {t('Confirm password')}
                        </AuthSubmit>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your password',
    description:
        'This is a secure area of the application. Please confirm your password before continuing.',
};

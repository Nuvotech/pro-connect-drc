import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import { AuthField, AuthInput, AuthSubmit } from '@/components/auth/auth-form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { t } from '@/lib/i18n';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState(false);
    const [code, setCode] = useState('');

    setLayoutProps(
        showRecoveryInput
            ? {
                  title: 'Recovery code',
                  description:
                      'Please confirm access to your account by entering one of your emergency recovery codes.',
              }
            : {
                  title: 'Authentication code',
                  description:
                      'Enter the authentication code provided by your authenticator application.',
              },
    );

    function toggleRecoveryMode(clearErrors: () => void) {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    }

    return (
        <>
            <Head title={t('Two-factor authentication')} />

            <Form
                {...store.form()}
                className="flex flex-col gap-5"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <AuthField
                                id="recovery_code"
                                label={t('Recovery code')}
                                error={errors.recovery_code}
                            >
                                <AuthInput
                                    id="recovery_code"
                                    name="recovery_code"
                                    type="text"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    required
                                    aria-invalid={Boolean(errors.recovery_code)}
                                />
                            </AuthField>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                    aria-label={t('Authentication code')}
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="size-11 border-outline-variant text-body-lg"
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                {errors.code && (
                                    <p
                                        role="alert"
                                        className="text-label-sm text-error"
                                    >
                                        {t(errors.code)}
                                    </p>
                                )}
                            </div>
                        )}

                        <AuthSubmit processing={processing}>
                            {t('Continue')}
                        </AuthSubmit>

                        <button
                            type="button"
                            onClick={() => toggleRecoveryMode(clearErrors)}
                            className="cursor-pointer text-center text-label-md text-primary underline-offset-2 hover:underline"
                        >
                            {showRecoveryInput
                                ? t('Use an authentication code instead')
                                : t('Use a recovery code instead')}
                        </button>
                    </>
                )}
            </Form>
        </>
    );
}

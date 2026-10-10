import { Form, Head, Link, setLayoutProps } from '@inertiajs/react';
import { AuthStatus, AuthSubmit } from '@/components/auth/auth-form';
import MaterialSymbol from '@/components/directory/material-symbol';
import { t } from '@/lib/i18n';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({
    status,
    hasEmail = true,
}: {
    status?: string;
    hasEmail?: boolean;
}) {
    if (!hasEmail) {
        setLayoutProps({
            title: 'Almost there',
            description:
                'We will send your verification link on WhatsApp shortly. Open it to access your account.',
        });
    }

    return (
        <>
            <Head
                title={
                    hasEmail
                        ? t('Email verification')
                        : t('Account verification')
                }
            />

            <div className="mb-5 flex justify-center">
                <MaterialSymbol
                    name={hasEmail ? 'mark_email_unread' : 'chat'}
                    className="text-[48px] text-primary"
                />
            </div>

            {status === 'verification-link-sent' && (
                <AuthStatus>
                    {t(
                        'A new verification link has been sent to your email address.',
                    )}
                </AuthStatus>
            )}

            <Form {...send.form()} className="flex flex-col gap-3">
                {({ processing }) => (
                    <>
                        {hasEmail && (
                            <AuthSubmit processing={processing}>
                                {t('Resend verification email')}
                            </AuthSubmit>
                        )}
                        <Link
                            href={logout()}
                            as="button"
                            className="h-11 cursor-pointer rounded-lg text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                        >
                            {t('Log out')}
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Check your email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};

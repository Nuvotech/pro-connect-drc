import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Mail, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroyMessage,
    index as messagesIndex,
    update as updateMessage,
} from '@/routes/admin/messages';
import type { Paginated } from '@/types';

type InboxTab = 'unread' | 'read';

type ContactMessage = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    topic: string;
    message: string;
    locale: string;
    isRead: boolean;
    sentAt: string | null;
};

const tabs: { value: InboxTab; label: string }[] = [
    { value: 'unread', label: 'New' },
    { value: 'read', label: 'Handled' },
];

export default function Messages({
    tab,
    messages,
    selectedId,
    counts,
}: {
    tab: InboxTab;
    messages: Paginated<ContactMessage>;
    selectedId: number | null;
    counts: Record<InboxTab, number>;
}) {
    const [openId, setOpenId] = useState<number | null>(
        selectedId ?? messages.data[0]?.id ?? null,
    );
    const selected =
        messages.data.find((message) => message.id === openId) ?? null;

    useEffect(() => {
        setOpenId(selectedId ?? messages.data[0]?.id ?? null);
    }, [messages.data, selectedId]);

    function setRead(message: ContactMessage, isRead: boolean) {
        router.patch(
            updateMessage.url(message.id),
            { is_read: isRead },
            { preserveScroll: true },
        );
    }

    function remove(message: ContactMessage) {
        router.delete(destroyMessage.url(message.id), {
            preserveScroll: true,
        });
    }

    const whatsAppNumber = selected?.phone?.replace(/\D/g, '') ?? '';

    return (
        <>
            <Head title={t('Messages')} />

            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Messages')}
                    description={t(
                        'Messages sent through the Contact us page. Reply by email, phone or WhatsApp, then mark them as handled.',
                    )}
                />

                <nav
                    aria-label={t('Message status')}
                    className="-mb-px flex gap-6 border-b border-zinc-200"
                >
                    {tabs.map((item) => (
                        <Link
                            key={item.value}
                            href={messagesIndex({ query: { tab: item.value } })}
                            preserveScroll
                            aria-current={
                                tab === item.value ? 'page' : undefined
                            }
                            className={cn(
                                'flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                tab === item.value
                                    ? 'border-primary font-medium text-zinc-900'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-900',
                            )}
                        >
                            {t(item.label)}
                            <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums">
                                {counts[item.value]}
                            </span>
                        </Link>
                    ))}
                </nav>

                {messages.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <Inbox
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {tab === 'unread'
                                ? t('No new messages')
                                : t('No handled messages yet')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
                        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-2">
                            {messages.data.map((message) => (
                                <li key={message.id}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenId(message.id)}
                                        aria-current={
                                            message.id === openId
                                                ? 'true'
                                                : undefined
                                        }
                                        className={cn(
                                            'flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors duration-200 hover:bg-zinc-50',
                                            message.id === openId &&
                                                'bg-zinc-50',
                                        )}
                                    >
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-medium text-zinc-900">
                                                {message.name}
                                            </span>
                                            <span className="shrink-0 text-xs text-zinc-500">
                                                {message.sentAt}
                                            </span>
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {message.topic}
                                        </span>
                                        <span className="line-clamp-2 text-sm text-zinc-600">
                                            {message.message}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {selected && (
                            <article className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-6 lg:col-span-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold text-zinc-900">
                                            {selected.name}
                                        </h2>
                                        <p className="mt-0.5 text-sm text-zinc-500">
                                            {selected.topic} · {selected.sentAt}{' '}
                                            ·{' '}
                                            {selected.locale === 'en'
                                                ? 'English'
                                                : 'Français'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(selected)}
                                        aria-label={t('Delete message')}
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-800">
                                    {selected.message}
                                </p>

                                <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-5">
                                    {selected.email && (
                                        <a
                                            href={`mailto:${selected.email}`}
                                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                        >
                                            <Mail
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            {selected.email}
                                        </a>
                                    )}
                                    {selected.phone && (
                                        <>
                                            <a
                                                href={`tel:+${whatsAppNumber.startsWith('243') ? whatsAppNumber : `243${whatsAppNumber.replace(/^0/, '')}`}`}
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                            >
                                                <Phone
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                {selected.phone}
                                            </a>
                                            <a
                                                href={`https://wa.me/${whatsAppNumber.startsWith('243') ? whatsAppNumber : `243${whatsAppNumber.replace(/^0/, '')}`}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                            >
                                                <MessageCircle
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                {t('WhatsApp')}
                                            </a>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRead(selected, !selected.isRead)
                                        }
                                        className="ml-auto inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                    >
                                        {selected.isRead
                                            ? t('Mark as new')
                                            : t('Mark as handled')}
                                    </button>
                                </div>
                            </article>
                        )}
                    </div>
                )}

                {messages.last_page > 1 && (
                    <div className="flex justify-end gap-2 text-sm">
                        {messages.prev_page_url && (
                            <Link
                                href={messages.prev_page_url}
                                className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-zinc-700 hover:bg-zinc-50"
                            >
                                {t('Previous')}
                            </Link>
                        )}
                        {messages.next_page_url && (
                            <Link
                                href={messages.next_page_url}
                                className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3 text-zinc-700 hover:bg-zinc-50"
                            >
                                {t('Next')}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

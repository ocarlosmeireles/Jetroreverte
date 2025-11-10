

import React, { useMemo, ReactNode } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { NegotiationAttempt, NegotiationChannel, NegotiationAttemptType } from '../../types';
import { demoNegotiationAttempts } from '../../services/demoData';
// FIX: Add WhatsAppIcon to imports
import { XIcon, DocumentPlusIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon, WhatsAppIcon } from './icons';
import Button from './Button';
import { formatDate } from '../../utils/formatters';

interface ContactHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
}

const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } },
};

const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
};

const ChannelIcon = ({ channel }: { channel: NegotiationChannel }) => {
    // FIX: Add SMS to the map and use the correct WhatsApp icon to satisfy the Record type.
    const iconMap: Record<NegotiationChannel, ReactNode> = {
        [NegotiationChannel.EMAIL]: <EnvelopeIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.WHATSAPP]: <WhatsAppIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PHONE_CALL]: <PhoneIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.PETITION_GENERATED]: <DocumentPlusIcon className="w-5 h-5 text-neutral-500" />,
        [NegotiationChannel.SMS]: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-neutral-500" />,
    };
    return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 ring-4 ring-white">{iconMap[channel]}</div>;
};

const ContactHistoryModal = ({ isOpen, onClose, invoiceId }: ContactHistoryModalProps): React.ReactElement => {
    const attempts = useMemo(() => {
        return demoNegotiationAttempts
            .filter(a => a.invoiceId === invoiceId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoiceId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-neutral-800">Histórico de Contato da Cobrança</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="overflow-y-auto flex-grow p-6">
                            {attempts.length > 0 ? (
                                <div className="relative pl-6">
                                    <div className="absolute top-0 bottom-0 left-[21px] w-0.5 bg-neutral-200" />
                                    {attempts.map(attempt => (
                                        <div key={attempt.id} className="relative mb-6">
                                            <ChannelIcon channel={attempt.channel} />
                                            <div className="ml-12 pt-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>
                                                        {attempt.type === NegotiationAttemptType.ADMINISTRATIVE ? 'Contato Administrativo' : 'Preparação Judicial'}
                                                    </p>
                                                    <p className="text-xs text-neutral-400">{formatDate(attempt.date)} ({getRelativeTime(attempt.date)})</p>
                                                </div>
                                                <p className="text-sm text-neutral-600 mt-1">{attempt.notes}</p>
                                                <p className="text-xs text-neutral-500 mt-1">por: {attempt.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 bg-neutral-50 rounded-lg">
                                    <p className="text-neutral-500">Nenhuma tentativa de contato registrada para esta cobrança.</p>
                                </div>
                            )}
                        </div>
                        <footer className="p-6 border-t border-neutral-200 flex-shrink-0 bg-neutral-50 rounded-b-2xl flex justify-end">
                            <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ContactHistoryModal;
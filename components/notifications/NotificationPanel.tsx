

import React, { ReactNode } from 'react';
// FIX: Import Variants type from framer-motion.
import { motion, Variants } from 'framer-motion';
import { Notification, NotificationType } from '../../types';
import { XIcon, CheckIcon, DollarIcon, SchoolIcon, UsersIcon } from '../common/icons';
import Button from '../common/Button';

interface NotificationPanelProps {
    onClose: () => void;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// FIX: Explicitly type panelVariants with the Variants type.
const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
    exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
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
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
    const iconMap: Record<NotificationType, ReactNode> = {
        [NotificationType.PAYMENT_RECEIVED]: <DollarIcon className="w-5 h-5 text-green-500" />,
        [NotificationType.INVOICE_OVERDUE]: <DollarIcon className="w-5 h-5 text-red-500" />,
        [NotificationType.NEW_SCHOOL_CLIENT]: <SchoolIcon className="w-5 h-5 text-blue-500" />,
        [NotificationType.NEW_INVOICE_ASSIGNED]: <UsersIcon className="w-5 h-5 text-indigo-500" />,
        [NotificationType.SUBSCRIPTION_PAYMENT_FAILED]: <SchoolIcon className="w-5 h-5 text-orange-500" />,
    };
    return (
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-100">
            {iconMap[type]}
        </div>
    );
}

const NotificationPanel = ({ onClose, notifications, onNotificationClick, onMarkAllAsRead }: NotificationPanelProps) => {
    return (
        <div className="fixed inset-0 z-40" aria-labelledby="notification-panel-title" role="dialog" aria-modal="true">
            <motion.div
                className="absolute inset-0 bg-black/40"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
            />
            <motion.div
                className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl flex flex-col"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <header className="p-4 border-b border-neutral-200 flex justify-between items-center flex-shrink-0">
                    <h2 id="notification-panel-title" className="text-lg font-bold text-neutral-800">
                        Notificações
                    </h2>
                    <div className="flex items-center gap-2">
                         <Button size="sm" variant="secondary" onClick={onMarkAllAsRead} icon={<CheckIcon className="w-4 h-4" />}>
                            Marcar como lidas
                        </Button>
                        <button onClick={onClose} className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto">
                    {notifications.length > 0 ? (
                         <ul className="divide-y divide-neutral-100">
                            {notifications.map(notification => (
                                <li key={notification.id}>
                                    <button
                                        onClick={() => onNotificationClick(notification)}
                                        className={`w-full text-left p-4 transition-colors hover:bg-neutral-50 ${!notification.read ? 'bg-primary-50/50' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <NotificationIcon type={notification.type} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="font-semibold text-sm text-neutral-800">{notification.title}</p>
                                                    <p className="text-xs text-neutral-400 flex-shrink-0">{getRelativeTime(notification.createdAt)}</p>
                                                </div>
                                                <p className="text-sm text-neutral-600 mt-0.5">{notification.message}</p>
                                            </div>
                                             {!notification.read && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" title="Não lida"></div>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            <p>Você não tem nenhuma notificação no momento.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default NotificationPanel;
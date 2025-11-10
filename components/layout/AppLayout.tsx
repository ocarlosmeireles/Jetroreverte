
import React, { useState, ReactNode, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { useAuth } from '../../hooks/useAuth';
import { demoNotifications } from '../../services/demoData';
import { Notification } from '../../types';
import NotificationPanel from '../notifications/NotificationPanel';
import Logo from '../common/Logo';

interface NavItem {
    name: string;
    path: string;
}

interface AppLayoutProps {
    children?: ReactNode;
    navItems: NavItem[];
    activePage: string;
    setActivePage: (page: string) => void;
    pageTitle: string;
}

const AppLayout = ({ children, navItems, activePage, setActivePage, pageTitle }: AppLayoutProps): React.ReactElement => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Simulate fetching notifications
            const userNotifications = demoNotifications
                .filter(n => (user.role === 'ESCRITORIO' && (n.userId.includes('escritorio'))) ||
                             (user.role === 'ESCOLA' && (n.userId.includes('escola'))))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(userNotifications);
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    
    const handleNotificationClick = (notification: Notification) => {
        handleMarkAsRead(notification.id);
        if (notification.link) {
            setActivePage(notification.link);
        }
        setNotificationsOpen(false);
    };

    return (
        <div className="min-h-screen font-sans flex w-full h-screen overflow-hidden bg-neutral-100">
            <Sidebar
                navItems={navItems}
                activePage={activePage}
                setActivePage={setActivePage}
                isOpen={isSidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                notificationCount={unreadCount}
                onNotificationClick={() => setNotificationsOpen(true)}
            />
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <Header
                    pageTitle={pageTitle}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                {children}
            </div>
            
            <AnimatePresence>
            {isNotificationsOpen && (
                <NotificationPanel 
                    onClose={() => setNotificationsOpen(false)}
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            )}
            </AnimatePresence>
        </div>
    );
};

export default AppLayout;
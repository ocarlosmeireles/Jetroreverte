import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import AppLayout from '../../components/layout/AppLayout';
import PlatformOverview from '../super-admin/PlatformOverview';
import UserManagement from '../super-admin/UserManagement';
import SaasSettings from '../super-admin/SaasSettings';

const SuperAdminDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('overview');
    const navItems = NAVIGATION[UserRole.SUPER_ADMIN];
    const pageTitle = navItems.find(p => p.path === activePage)?.name || 'Visão Geral';

    const renderContent = () => {
        switch (activePage) {
            case 'overview':
                return <PlatformOverview />;
            case 'users':
                return <UserManagement />;
            case 'settings':
                return <SaasSettings />;
            default:
                return <PlatformOverview />;
        }
    };
    
    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={setActivePage}
            pageTitle={pageTitle}
        >
             <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6 sm:mb-8">{pageTitle}</h1>
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default SuperAdminDashboard;
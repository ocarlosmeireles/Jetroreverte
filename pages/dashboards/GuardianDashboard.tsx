
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import GuardianInvoicesList from '../guardian/GuardianInvoicesList';
import PaymentHistory from '../guardian/PaymentHistory';
import AppLayout from '../../components/layout/AppLayout';


const GuardianDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('cobrancas');
    const navItems = NAVIGATION[UserRole.RESPONSAVEL];
    const pageTitle = navItems.find(p => p.path === activePage)?.name || 'Meus Débitos';

    const renderContent = () => {
        switch (activePage) {
            case 'cobrancas':
                return <GuardianInvoicesList />;
            case 'historico':
                 return <PaymentHistory />;
            default:
                return <GuardianInvoicesList />;
        }
    };

    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={setActivePage}
            pageTitle={pageTitle}
        >
             <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
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

export default GuardianDashboard;
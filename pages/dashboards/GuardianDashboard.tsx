

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import GuardianFinancials from '../guardian/GuardianInvoicesList';
import PaymentHistory from '../guardian/PaymentHistory';
import AppLayout from '../../components/layout/AppLayout';
import NegotiationPortal from '../guardian/NegotiationPortal';


interface ViewState {
    view: 'list' | 'detail';
    id: string | null;
}

const GuardianDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('cobrancas');
    const [negotiationViewState, setNegotiationViewState] = useState<ViewState>({ view: 'list', id: null });

    const navItems = NAVIGATION[UserRole.RESPONSAVEL];
    let pageTitle = navItems.find(p => p.path === activePage)?.name || 'Saúde Financeira';
    if (negotiationViewState.view === 'detail') {
        pageTitle = 'Portal de Negociação';
    }

    const handleSetActivePage = (page: string) => {
        setNegotiationViewState({ view: 'list', id: null });
        setActivePage(page);
    };

    const handleStartNegotiation = (invoiceId: string) => {
        setActivePage('cobrancas');
        setNegotiationViewState({ view: 'detail', id: invoiceId });
    };

    const handleBackToList = () => {
        setNegotiationViewState({ view: 'list', id: null });
    };

    const renderContent = () => {
        switch (activePage) {
            case 'cobrancas':
                if (negotiationViewState.view === 'detail' && negotiationViewState.id) {
                    return <NegotiationPortal invoiceId={negotiationViewState.id} onBack={handleBackToList} />;
                }
                return <GuardianFinancials onStartNegotiation={handleStartNegotiation} />;
            case 'historico':
                 return <PaymentHistory />;
            default:
                return <GuardianFinancials onStartNegotiation={handleStartNegotiation} />;
        }
    };

    const animationKey = activePage + (negotiationViewState.id || '');

    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            pageTitle={pageTitle}
        >
             <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animationKey}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default GuardianDashboard;
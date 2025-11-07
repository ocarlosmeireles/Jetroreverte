import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAVIGATION } from '../../constants';
import { UserRole } from '../../types';
import AdminDashboardContent from '../admin/AdminDashboardContent';
import SchoolsList from '../admin/SchoolsList';
import SaasFinancialDashboard from '../admin/SaasFinancialDashboard';
import PagePlaceholder from '../common/PagePlaceholder';
import { DocumentReportIcon } from '../../components/common/icons';
import AppLayout from '../../components/layout/AppLayout';
// FIX: Changed import from '../admin/NegotiationHistory' (an empty file) to the correct, existing component for handling negotiations.
import NegotiationsDashboard from '../law-firm/NegotiationsDashboard';

const AdminDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('dashboard');
    // FIX: Changed UserRole.ADMIN to UserRole.ESCRITORIO as the ADMIN role does not exist.
    const navItems = NAVIGATION[UserRole.ESCRITORIO];
    const pageTitle = navItems.find(p => p.path === activePage)?.name || 'Dashboard';

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboardContent />;
            case 'escolas':
                return <SchoolsList />;
            case 'negociacoes':
                return <NegotiationsDashboard />;
            case 'financeiro':
                return <SaasFinancialDashboard />;
            case 'relatorios':
                return <PagePlaceholder 
                            icon={<DocumentReportIcon className="w-16 h-16 text-primary-300" />}
                            title="Relatórios Avançados"
                            message="Em breve, você terá acesso a relatórios detalhados sobre crescimento, churn e muito mais."
                        />;
            default:
                return <AdminDashboardContent />;
        }
    };
    
    return (
        <AppLayout
            navItems={navItems}
            activePage={activePage}
            setActivePage={setActivePage}
            pageTitle={pageTitle}
        >
             {/* FIX: Wrapped content in a div to provide consistent padding and scrolling. */}
             <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
             </div>
        </AppLayout>
    );
};

export default AdminDashboard;


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
import CollectionHubPage from '../law-firm/CollectionHubPage';

const AdminDashboard = (): React.ReactElement => {
    const [activePage, setActivePage] = useState('dashboard');
    const navItems = NAVIGATION[UserRole.ESCRITORIO];
    const pageTitle = navItems.find(p => p.path === activePage)?.name || 'Dashboard';

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboardContent />;
            case 'escolas':
                return <SchoolsList />;
            case 'gestao-cobrancas':
                return <CollectionHubPage />;
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
             <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <AnimatePresence mode---
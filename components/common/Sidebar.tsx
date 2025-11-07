

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
    DashboardIcon,
    SchoolIcon,
    UsersIcon,
    DollarIcon,
    DocumentReportIcon,
    BillingIcon,
    XIcon,
    Cog6ToothIcon,
    LogoutIcon,
    UserCircleIcon,
    BellIcon,
    ScaleIcon,
    SparklesIcon,
    BriefcaseIcon,
    ShieldCheckIcon,
} from './icons';

interface NavItem {
    name: string;
    path: string;
}

interface SidebarProps {
    navItems: NavItem[];
    activePage: string;
    setActivePage: (page: string) => void;
    isOpen: boolean;
    closeSidebar: () => void;
    notificationCount: number;
    onNotificationClick: () => void;
}

const iconMap: { [key: string]: React.ReactElement } = {
    'Painel de Cobranças': <DashboardIcon />,
    'Dashboard': <DashboardIcon />,
    'Dashboard Geral': <DashboardIcon />,
    'Gestão de Escolas': <SchoolIcon />,
    'Escolas Clientes': <SchoolIcon />,
    'Alunos Inadimplentes': <UsersIcon />,
    'Responsáveis': <UsersIcon />,
    'Cobranças': <DollarIcon />,
    'Cobranças (Geral)': <DollarIcon />,
    'Histórico de Cobranças': <DollarIcon />,
    'Financeiro': <DollarIcon />,
    'Relatórios': <DocumentReportIcon />,
    'Relatórios Consolidados': <DocumentReportIcon />,
    'Meu Plano': <BillingIcon />,
    'Meus Débitos': <DollarIcon />,
    'Histórico de Pagamentos': <DocumentReportIcon />,
    'Escolas': <SchoolIcon />,
    'Negociações': <ScaleIcon />,
    'Petições (IA)': <ScaleIcon />,
    'Processos Judiciais': <BriefcaseIcon />,
    'Hub de Marketing': <SparklesIcon />,
    'Auditor de Contratos (IA)': <ShieldCheckIcon />,
    'Configurações': <Cog6ToothIcon />,
    'Visão Geral': <DashboardIcon />,
    'Usuários': <UsersIcon />,
    'Configurações SaaS': <Cog6ToothIcon />,
};

// FIX: Added an optional `key` property to the `NavLinkProps` interface to resolve the TypeScript error when rendering a list of NavLink components.
interface NavLinkProps {
    key?: React.Key;
    item: NavItem;
    activePage: string;
    setActivePage: (page: string) => void;
    closeSidebar: () => void;
    isMobile?: boolean;
}

const NavLink = ({ item, activePage, setActivePage, closeSidebar, isMobile = false }: NavLinkProps) => {
    const isActive = activePage === item.path;

    const handleNavigation = (path: string) => {
        setActivePage(path);
        if (isMobile) {
            closeSidebar();
        }
    };
    
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                }}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors duration-200 ease-in-out ${
                    isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-800'
                }`}
            >
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>
                    {React.cloneElement(iconMap[item.name] as React.ReactElement<any>, { className: 'w-6 h-6' })}
                </span>
                <span className="text-sm ml-4">{item.name}</span>
            </a>
        </li>
    )
};


const SidebarContent = ({ navItems, activePage, setActivePage, notificationCount, onNotificationClick, closeSidebar, isMobile=false }: Omit<SidebarProps, 'isOpen'> & { isMobile?: boolean }) => {
    const { user, logout } = useAuth();

    const filteredNavItems = useMemo(() => {
        if (user?.modulePermissions) {
            const permissionSet = new Set(user.modulePermissions);
            return navItems.filter(item => permissionSet.has(item.path));
        }
        return navItems;
    }, [user, navItems]);


    return (
        <div className="bg-white text-neutral-800 flex flex-col h-full border-r border-neutral-200/80">
            <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between lg:justify-start h-20">
                <span className="text-xl font-extrabold tracking-tight text-neutral-800">Jetro Reverte</span>
                 <button onClick={closeSidebar} className="p-1 text-neutral-500 hover:text-neutral-900 lg:hidden">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow p-3">
                <ul className="space-y-1.5">
                    {filteredNavItems.map((item) => (
                        <NavLink key={item.path} item={item} activePage={activePage} setActivePage={setActivePage} closeSidebar={closeSidebar} isMobile={isMobile} />
                    ))}
                </ul>
            </nav>
            <div className="p-3 border-t border-neutral-200/80">
                 <div className="flex items-center p-2 rounded-lg">
                    {user?.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt="Foto do perfil" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-10 h-10 text-neutral-400 flex-shrink-0" />
                    )}
                    <div className="ml-3 min-w-0 flex-1">
                        <p className="font-semibold text-sm text-neutral-800 truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-500 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
                    </div>
                     <div className="flex items-center">
                        <button onClick={onNotificationClick} title="Notificações" className="relative p-2 rounded-full text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors">
                            <BellIcon className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                            )}
                        </button>
                        <button onClick={logout} title="Sair" className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors">
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
}

const Sidebar = (props: SidebarProps): React.ReactElement => {
    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: '-100%' },
    };

    const backdropVariants = {
      open: { opacity: 1 },
      closed: { opacity: 0 },
    }

    return (
        <>
            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {props.isOpen && (
                    <>
                         <motion.div
                            variants={backdropVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={props.closeSidebar}
                        />
                        <motion.aside 
                            className="w-72 fixed top-0 left-0 h-full z-50 lg:hidden"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={sidebarVariants}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <SidebarContent {...props} isMobile={true} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            {/* Desktop Sidebar (Fixed) */}
            <aside className="w-64 hidden lg:block flex-shrink-0 h-screen sticky top-0">
                <SidebarContent {...props} />
            </aside>
        </>
    );
};

export default Sidebar;
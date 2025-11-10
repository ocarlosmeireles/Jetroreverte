import { UserRole, Plan, PlanId } from "./types";
import { 
    DashboardIcon, 
    SchoolIcon, 
    UsersIcon, 
    DollarIcon, 
    DocumentReportIcon, 
    BillingIcon, 
    Cog6ToothIcon, 
    HeartIcon,
    ScaleIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    ChatBubbleLeftRightIcon,
    WrenchScrewdriverIcon,
    DocumentChartBarIcon
} from './components/common/icons';

export const DEMO_USERS = {
    SUPER_ADMIN: { email: 'superadmin@demo.com', password: 'password' },
    ESCRITORIO: { email: 'escritorio@demo.com', password: 'password' },
    ESCOLA: { email: 'escola@demo.com', password: 'password' },
    RESPONSAVEL: { email: 'pai@demo.com', password: 'password' },
};

export const DEFAULT_COMMISSION_PERCENTAGE = 10;

export const PLANS: Plan[] = [
    {
        id: PlanId.BASIC,
        name: 'Básico',
        price: { monthly: 99, yearly: 990 },
        studentLimit: 50,
        features: [
            'Gestão de até 50 alunos inadimplentes',
            'Dashboard de performance',
            'Portal do responsável para auto-negociação',
            'Relatórios simples de recuperação',
            'Suporte via e-mail',
        ],
    },
    {
        id: PlanId.PRO,
        name: 'Pro',
        price: { monthly: 149, yearly: 1490 },
        studentLimit: 200,
        features: [
            'Gestão de até 200 alunos inadimplentes',
            'Todas as funcionalidades do plano Básico',
            'Módulo de Prevenção à Inadimplência com IA',
            'Auditor de Contratos com IA',
            'Consultor Estratégico de IA',
            'Suporte prioritário via chat',
        ],
    }
];

export const NAVIGATION = {
    [UserRole.SUPER_ADMIN]: [
        { name: 'Visão Geral', path: 'overview', icon: DashboardIcon },
        { name: 'Usuários', path: 'users', icon: UsersIcon },
        { name: 'Configurações SaaS', path: 'settings', icon: Cog6ToothIcon },
    ],
    [UserRole.ESCRITORIO]: [
        { name: 'Dashboard Geral', path: 'dashboard', icon: DashboardIcon },
        { name: 'Escolas Clientes', path: 'escolas', icon: SchoolIcon },
        { name: 'Gestão de Cobranças', path: 'gestao-cobrancas', icon: WrenchScrewdriverIcon },
        { name: 'Petições (IA)', path: 'peticoes', icon: ScaleIcon },
        { name: 'Processos Judiciais', path: 'processos', icon: BriefcaseIcon },
        { name: 'Financeiro', path: 'financeiro', icon: DollarIcon },
        { name: 'Relatórios Consolidados', path: 'relatorios', icon: DocumentChartBarIcon },
        { name: 'Configurações', path: 'configuracoes', icon: Cog6ToothIcon },
    ],
    [UserRole.ESCOLA]: [
        { name: 'Dashboard', path: 'dashboard', icon: DashboardIcon },
        { name: 'Alunos Inadimplentes', path: 'alunos', icon: UsersIcon },
        { name: 'Prevenção (IA)', path: 'prevencao', icon: ShieldCheckIcon },
        { name: 'Responsáveis', path: 'responsaveis', icon: UsersIcon },
        { name: 'Histórico de Cobranças', path: 'cobrancas', icon: DollarIcon },
        { name: 'Negociações', path: 'negociacoes', icon: ScaleIcon },
        { name: 'Processos Judiciais', path: 'processos', icon: BriefcaseIcon },
        { name: 'Auditor de Contratos (IA)', path: 'auditor', icon: ShieldCheckIcon },
        { name: 'Consultor IA', path: 'consultor-ia', icon: ChatBubbleLeftRightIcon },
        { name: 'Relatórios', path: 'relatorios', icon: DocumentReportIcon },
        { name: 'Meu Plano', path: 'plano', icon: BillingIcon },
    ],
    [UserRole.RESPONSAVEL]: [
        { name: 'Meus Débitos', path: 'cobrancas', icon: DollarIcon },
        { name: 'Histórico de Pagamentos', path: 'historico', icon: DocumentReportIcon },
    ],
};

// Juros para parcelamento do acordo
export const INSTALLMENT_RATES = {
    1: 0,
    2: 0.015, // 1.5%
    3: 0.02,  // 2%
    4: 0.025, // 2.5%
    5: 0.03,  // 3%
    6: 0.035, // 3.5%
    7: 0.04,  // 4%
    8: 0.045, // 4.5%
    9: 0.05,  // 5%
    10: 0.055, // 5.5%
    11: 0.06,  // 6%
    12: 0.065, // 6.5%
};

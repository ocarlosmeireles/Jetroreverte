
import { UserRole, Plan } from './types';

export const DEMO_USERS = {
    SUPER_ADMIN: { email: 'superadmin@demo.com', password: 'password' },
    ESCRITORIO: { email: 'escritorio@demo.com', password: 'password' },
    ESCOLA: { email: 'escola@demo.com', password: 'password' },
    RESPONSAVEL: { email: 'pai@demo.com', password: 'password' }, // Matches guardian 'resp-01'
};

export const DEFAULT_COMMISSION_PERCENTAGE = 10;

// FIX: Added PLANS constant for the pricing page.
export const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'Básico',
        price: { monthly: 99, yearly: 990 },
        features: [
            'Gestão de até 100 alunos inadimplentes',
            'Envio de lembretes automáticos',
            'Portal do responsável',
            'Relatórios básicos',
            'Suporte via email',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 149, yearly: 1490 },
        features: [
            'Alunos inadimplentes ilimitados',
            'Tudo do plano Básico',
            'Régua de cobrança personalizada',
            'Relatórios avançados',
            'Suporte prioritário (WhatsApp)',
            'Integração com sistema de pagamento',
        ],
    },
];

export const NAVIGATION = {
    [UserRole.ESCRITORIO]: [
        { name: 'Dashboard Geral', path: 'dashboard' },
        { name: 'Gestão de Escolas', path: 'escolas' },
        { name: 'Negociações', path: 'negociacoes' },
        { name: 'Cobranças (Geral)', path: 'cobrancas' },
        { name: 'Petições (IA)', path: 'peticoes' },
        { name: 'Financeiro', path: 'financeiro' },
        { name: 'Relatórios Consolidados', path: 'relatorios' },
        { name: 'Configurações', path: 'configuracoes' },
    ],
    [UserRole.ESCOLA]: [
        { name: 'Dashboard', path: 'dashboard' },
        { name: 'Alunos Inadimplentes', path: 'alunos' },
        { name: 'Responsáveis', path: 'responsaveis' },
        { name: 'Cobranças', path: 'cobrancas' },
        { name: 'Relatórios', path: 'relatorios' },
        { name: 'Meu Plano', path: 'plano' },
    ],
    [UserRole.RESPONSAVEL]: [
        { name: 'Meus Débitos', path: 'cobrancas' },
        { name: 'Histórico de Pagamentos', path: 'historico' },
    ],
    [UserRole.SUPER_ADMIN]: [
        { name: 'Visão Geral', path: 'overview' },
        { name: 'Usuários', path: 'users' },
        { name: 'Configurações SaaS', path: 'settings' },
    ]
};
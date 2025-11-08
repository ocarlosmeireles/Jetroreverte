

import { UserRole, Plan } from './types';

export const DEMO_USERS = {
    SUPER_ADMIN: { email: 'superadmin@demo.com', password: 'password' },
    ESCRITORIO: { email: 'escritorio@demo.com', password: 'password' },
    ESCOLA: { email: 'escola@demo.com', password: 'password' },
    RESPONSAVEL: { email: 'pai@demo.com', password: 'password' }, // Matches guardian 'resp-01'
};

export const DEFAULT_COMMISSION_PERCENTAGE = 10;

export const INSTALLMENT_RATES: { [key: number]: number } = {
    2: 0.0539,
    3: 0.0612,
    4: 0.0685,
    5: 0.0757,
    6: 0.0828,
    7: 0.0899,
    8: 0.0969,
    9: 0.1038,
    10: 0.1106,
    11: 0.1174,
    12: 0.1240,
};

export const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'Básico',
        price: { monthly: 99, yearly: 990 },
        studentLimit: 100,
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
        studentLimit: null, // Unlimited
        features: [
            'Alunos inadimplentes ilimitados',
            'Tudo do plano Básico',
            'Régua de cobrança personalizada com IA',
            'Geração de Petições com IA',
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
        { name: 'Negociação "Live" (IA)', path: 'live-negociacao' },
        { name: 'Cobranças (Geral)', path: 'cobrancas' },
        { name: 'Petições (IA)', path: 'peticoes' },
        { name: 'Processos Judiciais', path: 'processos' },
        { name: 'Hub de Marketing', path: 'marketing' },
        { name: 'Financeiro', path: 'financeiro' },
        { name: 'Relatórios Consolidados', path: 'relatorios' },
        { name: 'Configurações', path: 'configuracoes' },
    ],
    [UserRole.ESCOLA]: [
        { name: 'Dashboard', path: 'dashboard' },
        { name: 'Alunos Inadimplentes', path: 'alunos' },
        { name: 'Prevenção (IA)', path: 'prevencao' },
        { name: 'Responsáveis', path: 'responsaveis' },
        { name: 'Cobranças', path: 'cobrancas' },
        { name: 'Negociações', path: 'negociacoes' },
        { name: 'Processos Judiciais', path: 'processos' },
        { name: 'Auditor de Contratos (IA)', path: 'auditor' },
        { name: 'Consultor IA', path: 'consultor-ia' },
        { name: 'Relatórios', path: 'relatorios' },
        { name: 'Meu Plano', path: 'plano' },
    ],
    [UserRole.RESPONSAVEL]: [
        { name: 'Saúde Financeira', path: 'cobrancas' },
        { name: 'Histórico de Pagamentos', path: 'historico' },
    ],
    [UserRole.SUPER_ADMIN]: [
        { name: 'Visão Geral', path: 'overview' },
        { name: 'Usuários', path: 'users' },
        { name: 'Configurações SaaS', path: 'settings' },
    ]
};
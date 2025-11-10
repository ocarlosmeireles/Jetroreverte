export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ESCRITORIO = 'ESCRITORIO',
    ESCOLA = 'ESCOLA',
    RESPONSAVEL = 'RESPONSAVEL',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    officeName?: string;
    officeAddress?: string;
    officePhone?: string;
    oabNumber?: string;
    profilePictureUrl?: string;
    officeLogoUrl?: string;
    schoolId?: string;
    modulePermissions?: string[];
}

export interface School {
    id: string;
    officeId: string;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    healthScore?: number;
    healthSummary?: string;
    financialContactName?: string;
    financialContactEmail?: string;
    financialContactPhone?: string;
    legalRepresentativeName?: string;
    legalRepresentativeCpf?: string;
    totalStudents?: number;
    averageTuition?: number;
    currentDefaultRate?: number;
    internalCollectionProcess?: string;
    collectionRuler?: CollectionRuler;
}

export interface CollectionStep {
    day: number;
    action: string;
    channel: string; // 'WhatsApp', 'Email', 'Ligação', 'SMS', 'Petição'
}
export interface CollectionRuler {
    lowRisk: CollectionStep[];
    mediumRisk: CollectionStep[];
    highRisk: CollectionStep[];
}

export interface Guardian {
    id: string;
    name: string;
    phone: string;
    email: string;
    schoolId: string;
    cpf?: string;
    rg?: string;
    address?: string;
    relationship?: string; // Pai, Mãe, Tutor
}

export interface Student {
    id: string;
    name: string;
    class: string;
    guardianId: string;
    schoolId: string;
    guardianName?: string;
    registrationCode?: string;
    futureRiskScore?: number;
    riskPattern?: string;
}

export enum InvoiceStatus {
    PAGO = 'PAGO',
    PENDENTE = 'PENDENTE',
    VENCIDO = 'VENCIDO',
}

export enum CollectionStage {
    AGUARDANDO_CONTATO = 'AGUARDANDO_CONTATO',
    EM_NEGOCIACAO = 'EM_NEGOCIACAO',
    ACORDO_FEITO = 'ACORDO_FEITO',
    PAGAMENTO_RECUSADO = 'PAGAMENTO_RECUSADO',
    PREPARACAO_JUDICIAL = 'PREPARACAO_JUDICIAL'
}

export interface Invoice {
    id: string;
    studentId: string;
    schoolId: string;
    studentName: string;
    value: number;
    dueDate: string;
    status: InvoiceStatus;
    notes?: string;
    paymentLink?: string;
    receiptUrl?: string;
    riskScore?: number;
    collectionStage?: CollectionStage;
    isAutomationActive?: boolean;
    nextAutomatedAction?: {
        date: string;
        action: string;
    };
    // Detailed fields from student registration
    updatedValue?: number;
    overdueInstallments?: number;
    lastPaymentDate?: string;
    originalPaymentMethod?: string;
    schoolContactHistory?: string;
    commission?: number;
    agreement?: AgreementDetails;
}

export interface AgreementDetails {
    protocolNumber: string;
    installments: number;
    installmentValue: number;
    paymentMethod: 'Boleto' | 'Pix' | 'Cartão de Crédito';
    firstDueDate: string;
    createdAt: string;
    isApproved?: boolean;
}

export enum NegotiationAttemptType {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    JUDICIAL_PREPARATION = 'JUDICIAL_PREPARATION',
}

export enum NegotiationChannel {
    EMAIL = 'Email',
    WHATSAPP = 'WhatsApp',
    PHONE_CALL = 'Ligação',
    PETITION_GENERATED = 'Petição',
    SMS = 'SMS',
}

export interface NegotiationAttempt {
    id: string;
    invoiceId: string;
    date: string;
    type: NegotiationAttemptType;
    channel: NegotiationChannel;
    notes: string;
    author: string; // 'Sistema', 'Assistente Virtual', Nome do Advogado
}

export interface Petition {
    id: string;
    invoiceId: string;
    studentName: string;
    guardianName: string;
    schoolName: string;
    generatedAt: string;
    status: 'draft' | 'filed';
    content: string;
}

export interface NegotiationCase {
    invoice: Invoice;
    student: Student | undefined;
    guardian: Guardian | undefined;
    school: School | undefined;
    attempts: NegotiationAttempt[];
}

export interface LiveNegotiationHistory {
    id: string;
    studentId: string;
    studentName: string;
    guardianName: string;
    schoolName: string;
    date: string;
    transcript: string;
    finalSuggestion: string;
}

export enum JudicialProcessStatus {
    PROTOCOLADO = 'Protocolado',
    AGUARDANDO_CITACAO = 'Aguardando Citação',
    CONTESTACAO = 'Contestação',
    SENTENCA = 'Sentença',
    RECURSO = 'Recurso',
}

export interface ProcessEvent {
    id: string;
    date: string;
    type: 'FILING' | 'DECISION' | 'HEARING' | 'UPDATE';
    title: string;
    description: string;
    documents?: { name: string; url: string }[];
}

export interface JudicialProcess {
    id: string;
    officeId: string;
    petitionId: string;
    studentName: string;
    schoolName: string;
    processNumber: string;
    status: JudicialProcessStatus;
    lastUpdate: string;
    events: ProcessEvent[];
}

// SaaS-related types
export enum PlanId {
    BASIC = 'basic',
    PRO = 'pro',
}

export interface Plan {
    id: PlanId;
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    studentLimit: number | null;
}

export interface Subscription {
    id: string;
    schoolId: string;
    planId: PlanId;
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    trialEnd: string;
    currentPeriodEnd: string;
    cycle: 'monthly' | 'yearly';
}

export interface SaasInvoice {
    id: string;
    schoolId: string;
    amount: number;
    dueDate: string;
    createdAt: string;
    status: 'paid' | 'open' | 'void';
    invoicePdfUrl: string;
}

export enum NotificationType {
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    INVOICE_OVERDUE = 'INVOICE_OVERDUE',
    NEW_SCHOOL_CLIENT = 'NEW_SCHOOL_CLIENT',
    NEW_INVOICE_ASSIGNED = 'NEW_INVOICE_ASSIGNED',
    SUBSCRIPTION_PAYMENT_FAILED = 'SUBSCRIPTION_PAYMENT_FAILED',
    NEGOTIATION_REQUESTED = 'NEGOTIATION_REQUESTED',
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

// Marketing Hub Types
export interface Lead {
    id: string;
    officeId: string;
    schoolName: string;
    contactName: string;
    contactEmail: string;
    potentialValue: number;
    status: 'Prospect' | 'Contato' | 'Negociação' | 'Ganha' | 'Perdida';
    lastContactDate: string;
    notes?: string;
    campaignId?: string;
}

export interface Campaign {
    id: string;
    officeId: string;
    name: string;
    target: string;
    startDate: string;
    status: 'Planejada' | 'Ativa' | 'Concluída';
    leadsGenerated?: number;
    conversionRate?: number;
    valueGenerated?: number;
}

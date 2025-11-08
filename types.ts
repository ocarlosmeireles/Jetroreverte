

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ESCRITORIO = 'ESCRITORIO',
    ESCOLA = 'ESCOLA',
    RESPONSAVEL = 'RESPONSAVEL',
}

export interface User {
    id: string;
    name: string; // User's name
    officeName?: string; // Law firm's name
    email: string;
    role: UserRole;
    schoolId?: string; 
    officeAddress?: string;
    officePhone?: string;
    oabNumber?: string;
    officeLogoUrl?: string;
    profilePictureUrl?: string;
    modulePermissions?: string[];
}

export interface School {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    officeId: string; // ID of the law firm that owns this school record
    healthScore?: number; // AI-generated client health score (0-100)
    healthSummary?: string; // AI-generated summary and suggestions

    // Detailed registration fields
    financialContactName?: string;
    financialContactEmail?: string;
    financialContactPhone?: string;
    legalRepresentativeName?: string;
    legalRepresentativeCpf?: string;
    totalStudents?: number;
    averageTuition?: number; // Valor médio da mensalidade
    currentDefaultRate?: number; // Taxa de inadimplência atual em %
    internalCollectionProcess?: string; // Descrição do processo de cobrança interno
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
    relationship?: string;
}

export interface Student {
    id: string;
    name: string;
    class: string;
    registrationCode?: string;
    guardianId: string;
    schoolId: string;
    guardianName?: string;
    // AI Features for Delinquency Prevention
    futureRiskScore?: number; // Predictive Analysis: 0-100, probability of future default
    riskPattern?: string; // AI-generated summary of the risk pattern
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
    PREPARACAO_JUDICIAL = 'PREPARACAO_JUDICIAL',
    PAGAMENTO_RECUSADO = 'PAGAMENTO_RECUSADO',
}

export interface AgreementDetails {
    installments: number;
    installmentValue: number;
    paymentMethod: 'Boleto' | 'Pix' | 'Cartão de Crédito';
    firstDueDate: string;
    createdAt: string;
    protocolNumber: string;
    isApproved?: boolean;
}


export interface Invoice {
    id: string;
    studentId: string;
    schoolId: string;
    studentName?: string;
    value: number;
    updatedValue?: number;
    dueDate: string;
    status: InvoiceStatus;
    notes?: string;
    paymentLink?: string;
    receiptUrl?: string;
    commission?: number; // Law firm's commission
    collectionStage?: CollectionStage;
    agreement?: AgreementDetails;
    overdueInstallments?: number;
    lastPaymentDate?: string;
    originalPaymentMethod?: string;
    schoolContactHistory?: string;
    contractUrl?: string;
    policyUrl?: string;
    unpaidBillsUrl?: string;
    // AI Features
    riskScore?: number; // Predictive Analysis: 0-100, probability of default
    isAutomationActive?: boolean; // Collection Pipeline
    isCollectionAutomated?: boolean;
    nextAutomatedAction?: { // Collection Pipeline
        date: string; // ISO String
        action: string; // e.g., "WhatsApp Amigável"
    };
}

export interface CollectionHistory {
    id: string;
    studentId: string;
    date: string;
    message: string;
    status: 'ENVIADO' | 'FALHOU';
}

export enum PlanId {
    BASIC = 'basic',
    PRO = 'pro',
}

export interface Plan {
    id: PlanId | string;
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    studentLimit: number | null; // null represents 'unlimited'
}

export interface Subscription {
    id:string;
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
    link?: string; // a path like 'cobrancas' or 'escolas'
    read: boolean;
    createdAt: string; // ISO string
}

export enum NegotiationAttemptType {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    JUDICIAL_PREPARATION = 'JUDICIAL_PREPARATION',
}

export enum NegotiationChannel {
    WHATSAPP = 'WHATSAPP',
    EMAIL = 'EMAIL',
    PHONE_CALL = 'PHONE_CALL',
    PETITION_GENERATED = 'PETITION_GENERATED',
}

export interface NegotiationAttempt {
    id: string;
    invoiceId: string;
    date: string; // ISO string
    type: NegotiationAttemptType;
    channel: NegotiationChannel;
    notes: string;
    author: string; // Name of the person who made the contact
}

export interface Petition {
    id: string;
    invoiceId: string;
    studentName: string;
    guardianName: string;
    schoolName: string;
    generatedAt: string; // ISO string
    content: string;
    status: 'draft' | 'filed';
}

export enum LeadStatus {
    PROSPECT = 'Prospect',
    INITIAL_CONTACT = 'Contato Inicial',
    NEGOTIATION = 'Negociação',
    CLOSED_WON = 'Fechado (Ganho)',
    CLOSED_LOST = 'Fechado (Perdido)',
}

export interface Lead {
    id: string;
    officeId: string;
    schoolName: string;
    contactName: string;
    contactEmail: string;
    potentialValue: number;
    lastContactDate: string; // ISO String
    status: LeadStatus;
    notes?: string;
}

export interface Campaign {
    id: string;
    officeId: string;
    name: string;
    status: 'Ativa' | 'Concluída' | 'Planejada';
    target: string; // e.g. "Escolas de Ensino Médio de SP"
    startDate: string; // ISO String
    leadsGenerated: number;
    conversionRate?: number;
    valueGenerated?: number;
}

export enum JudicialProcessStatus {
    PROTOCOLADO = 'Protocolado',
    AGUARDANDO_CITACAO = 'Aguardando Citação',
    CONTESTACAO = 'Contestação',
    SENTENCA = 'Sentença',
    RECURSO = 'Recurso',
}

export interface JudicialProcess {
    id: string;
    officeId: string;
    petitionId: string;
    studentName: string;
    schoolName: string;
    processNumber: string;
    status: JudicialProcessStatus;
    lastUpdate: string; // ISO string
    notes?: string;
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
    date: string; // ISO string
    transcript: string;
    finalSuggestion: string;
}
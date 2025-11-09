export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ESCRITORIO = 'ESCRITORIO',
    ESCOLA = 'ESCOLA',
    RESPONSAVEL = 'RESPONSAVEL',
}

export interface User {
    id: string;
    name: string;
    officeName?: string;
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

export interface CollectionStep {
    day: number;
    action: string;
    channel: string;
}

export interface CollectionRuler {
    lowRisk: CollectionStep[];
    mediumRisk: CollectionStep[];
    highRisk: CollectionStep[];
}

export interface School {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    officeId: string;
    healthScore?: number;
    healthSummary?: string;
    collectionRuler?: CollectionRuler;
    financialContactName?: string;
    financialContactEmail?: string;
    financialContactPhone?: string;
    legalRepresentativeName?: string;
    legalRepresentativeCpf?: string;
    totalStudents?: number;
    averageTuition?: number;
    currentDefaultRate?: number;
    internalCollectionProcess?: string;
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
    schoolId:string;
    guardianName?: string;
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
    commission?: number;
    collectionStage?: CollectionStage;
    agreement?: AgreementDetails;
    overdueInstallments?: number;
    lastPaymentDate?: string;
    originalPaymentMethod?: string;
    schoolContactHistory?: string;
    contractUrl?: string;
    policyUrl?: string;
    unpaidBillsUrl?: string;
    riskScore?: number;
    isAutomationActive?: boolean;
    isCollectionAutomated?: boolean;
    nextAutomatedAction?: {
        date: string;
        action: string;
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

export enum NegotiationAttemptType {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    JUDICIAL_PREPARATION = 'JUDICIAL_PREPARATION',
}

export enum NegotiationChannel {
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
    PHONE_CALL = 'PHONE_CALL',
    PETITION_GENERATED = 'PETITION_GENERATED',
}

export interface NegotiationAttempt {
    id: string;
    invoiceId: string;
    date: string;
    type: NegotiationAttemptType;
    channel: NegotiationChannel;
    notes: string;
    author: string;
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

export enum JudicialProcessStatus {
    PROTOCOLADO = 'PROTOCOLADO',
    AGUARDANDO_CITACAO = 'AGUARDANDO_CITACAO',
    CONTESTACAO = 'CONTESTAÇÃO',
    SENTENCA = 'SENTENÇA',
    RECURSO = 'RECURSO',
}

export interface ProcessEvent {
    id: string;
    date: string;
    type: 'FILING' | 'DECISION' | 'HEARING' | 'UPDATE';
    title: string;
    description: string;
    documents?: { name: string, url: string }[];
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

export interface NegotiationCase {
    invoice: Invoice;
    student?: Student;
    guardian?: Guardian;
    school?: School;
    attempts: NegotiationAttempt[];
}

export interface Campaign {
    id: string;
    officeId: string;
    name: string;
    target: string;
    startDate: string;
    status: 'Planejada' | 'Ativa' | 'Concluída';
    leadsGenerated: number;
    conversionRate?: number;
    valueGenerated?: number;
}

export interface Lead {
    id: string;
    officeId: string;
    campaignId?: string;
    schoolName: string;
    contactName: string;
    contactEmail: string;
    status: 'Novo' | 'Contatado' | 'Qualificado' | 'Perdido' | 'Convertido';
    potentialValue: number;
    lastContactDate: string;
    notes?: string;
}

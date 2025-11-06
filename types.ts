

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
}

export interface School {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    phone: string;
    officeId: string; // ID of the law firm that owns this school record
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

// FIX: Added PlanId enum for subscription plans.
export enum PlanId {
    BASIC = 'basic',
    PRO = 'pro',
}

// FIX: Added Plan interface for pricing page.
export interface Plan {
    id: PlanId | string;
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
}

// FIX: Added Subscription interface for school billing.
export interface Subscription {
    id:string;
    schoolId: string;
    planId: PlanId;
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    trialEnd: string;
    currentPeriodEnd: string;
    cycle: 'monthly' | 'yearly';
}

// FIX: Added SaasInvoice interface for SaaS financial data.
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
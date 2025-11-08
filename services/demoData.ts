import { User, School, Guardian, Student, Invoice, Subscription, SaasInvoice, Notification, NegotiationAttempt, Petition, UserRole, InvoiceStatus, CollectionStage, PlanId, NotificationType, NegotiationAttemptType, NegotiationChannel, Campaign, JudicialProcess, JudicialProcessStatus, LiveNegotiationHistory, ProcessEvent } from '../types';

// ############### AVISO ###############
// Estes dados são usados para popular o banco de dados Firebase
// através da funcionalidade "Popular Banco" na tela de Configurações do Escritório.
// #####################################

export const demoUsers: User[] = []; // Users are managed by Firebase Auth

export const demoSchools: School[] = [
    { 
        id: 'school-01', 
        officeId: 'user-escritorio-01', 
        name: 'Escola Aprender Mais', 
        cnpj: '11.222.333/0001-44', 
        address: 'Rua das Flores, 123, São Paulo, SP', 
        phone: '(11) 98765-4321', 
        healthScore: 85, 
        healthSummary: 'Saúde Boa. Baixa inadimplência e alta taxa de recuperação recente. Sugestão: Oferecer upsell para o plano Pro.',
        financialContactName: 'Sra. Fátima Souza',
        financialContactEmail: 'financeiro@aprendermais.com',
        financialContactPhone: '(11) 98765-4322',
        legalRepresentativeName: 'João da Silva',
        legalRepresentativeCpf: '123.456.789-00',
        totalStudents: 500,
        averageTuition: 850,
        currentDefaultRate: 5,
        internalCollectionProcess: 'Envio de 2 emails de lembrete e uma ligação após 15 dias de vencido.',
    },
    { 
        id: 'school-02', 
        officeId: 'user-escritorio-01', 
        name: 'Colégio Saber Viver', 
        cnpj: '44.555.666/0001-77', 
        address: 'Av. do Conhecimento, 456, Rio de Janeiro, RJ', 
        phone: '(21) 91234-5678', 
        healthScore: 62, 
        healthSummary: 'Saúde Razoável. Inadimplência controlada, mas com alguns casos antigos. Sugestão: Iniciar uma campanha de negociação focada.',
        financialContactName: 'Sr. Roberto Almeida',
        financialContactEmail: 'financeiro@saberviver.com.br',
        financialContactPhone: '(21) 91234-5679',
        legalRepresentativeName: 'Maria Oliveira',
        legalRepresentativeCpf: '098.765.432-11',
        totalStudents: 800,
        averageTuition: 1200,
        currentDefaultRate: 8,
        internalCollectionProcess: 'Apenas um lembrete por e-mail 5 dias após o vencimento.',
    },
    { 
        id: 'school-03', 
        officeId: 'user-escritorio-01', 
        name: 'Instituto Crescer', 
        cnpj: '77.888.999/0001-00', 
        address: 'Praça da Educação, 789, Belo Horizonte, MG', 
        phone: '(31) 95555-4444', 
        healthScore: 35, 
        healthSummary: 'Saúde em Risco. Alto volume de inadimplência e baixa resposta às cobranças. Sugestão: Agendar reunião de alinhamento estratégico.',
        financialContactName: 'Ana Paula',
        financialContactEmail: 'financeiro@institutocrescer.edu',
        financialContactPhone: '(31) 95555-4445',
        legalRepresentativeName: 'Carlos Pereira',
        legalRepresentativeCpf: '111.222.333-44',
        totalStudents: 350,
        averageTuition: 650,
        currentDefaultRate: 15,
        internalCollectionProcess: 'Contato telefônico realizado pela secretaria após 30 dias de atraso.',
    },
];

export const demoGuardians: Guardian[] = [
    { id: 'resp-01', name: 'Carlos Silva', phone: '(11) 99999-1111', email: 'pai@demo.com', schoolId: 'school-01', cpf: '111.222.333-44', address: 'Rua das Flores, 123', relationship: 'Pai' },
    { id: 'resp-02', name: 'Ana Pereira', phone: '(11) 98888-2222', email: 'ana.pereira@example.com', schoolId: 'school-01', cpf: '222.333.444-55', address: 'Av. Principal, 500', relationship: 'Mãe' },
    { id: 'resp-03', name: 'Juliana Costa', phone: '(21) 97777-3333', email: 'juliana.costa@example.com', schoolId: 'school-02', cpf: '333.444.555-66', address: 'Rua da Praia, 200', relationship: 'Mãe' },
    { id: 'resp-04', name: 'Marcos Oliveira', phone: '(21) 96666-4444', email: 'marcos.oliveira@example.com', schoolId: 'school-02', cpf: '444.555.666-77', address: 'Alameda dos Sonhos, 300', relationship: 'Pai' },
    { id: 'resp-05', name: 'Fernanda Lima', phone: '(31) 95555-5555', email: 'fernanda.lima@example.com', schoolId: 'school-03', cpf: '555.666.777-88', address: 'Rua da Serra, 1010', relationship: 'Mãe' },
];

export const demoStudents: Student[] = [
    { id: 'stud-01', name: 'Lucas Silva', class: '5º Ano A', guardianId: 'resp-01', schoolId: 'school-01', guardianName: 'Carlos Silva' },
    { id: 'stud-02', name: 'Beatriz Pereira', class: '3º Ano B', guardianId: 'resp-02', schoolId: 'school-01', guardianName: 'Ana Pereira', futureRiskScore: 78, riskPattern: 'Pagamentos recentes feitos com mais de 5 dias de atraso.' },
    { id: 'stud-03', name: 'Gabriel Costa', class: '7º Ano C', guardianId: 'resp-03', schoolId: 'school-02', guardianName: 'Juliana Costa' },
    { id: 'stud-04', name: 'Mariana Oliveira', class: '1º Ano A', guardianId: 'resp-04', schoolId: 'school-02', guardianName: 'Marcos Oliveira', futureRiskScore: 65, riskPattern: 'Mudança frequente do método de pagamento (Boleto para Cartão e vice-versa).' },
    { id: 'stud-05', name: 'Sofia Lima', class: '8º Ano B', guardianId: 'resp-05', schoolId: 'school-03', guardianName: 'Fernanda Lima' },
    { id: 'stud-06', name: 'Davi Oliveira', class: '1º Ano A', guardianId: 'resp-04', schoolId: 'school-02', guardianName: 'Marcos Oliveira', futureRiskScore: 40, riskPattern: 'Histórico de pagamentos sempre próximo à data de vencimento.' },
];

export const demoInvoices: Invoice[] = [
    { id: 'inv-01', studentId: 'stud-01', schoolId: 'school-01', studentName: 'Lucas Silva', value: 750.50, dueDate: '2024-07-10T00:00:00Z', status: InvoiceStatus.VENCIDO, notes: 'Mensalidade de Julho/2024', collectionStage: CollectionStage.PREPARACAO_JUDICIAL, paymentLink: '#', riskScore: 85, isAutomationActive: true, nextAutomatedAction: { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), action: 'Email formal de cobrança' } },
    { id: 'inv-02', studentId: 'stud-01', schoolId: 'school-01', studentName: 'Lucas Silva', value: 750.50, dueDate: '2024-06-10T00:00:00Z', status: InvoiceStatus.PAGO, notes: 'Mensalidade de Junho/2024', collectionStage: CollectionStage.ACORDO_FEITO, receiptUrl: '#', riskScore: 10 },
    { id: 'inv-03', studentId: 'stud-02', schoolId: 'school-01', studentName: 'Beatriz Pereira', value: 680.00, dueDate: '2024-08-10T00:00:00Z', status: InvoiceStatus.PENDENTE, notes: 'Mensalidade de Agosto/2024', collectionStage: CollectionStage.AGUARDANDO_CONTATO, paymentLink: '#', riskScore: 25, isAutomationActive: false },
    { id: 'inv-04', studentId: 'stud-03', schoolId: 'school-02', studentName: 'Gabriel Costa', value: 820.00, dueDate: '2024-05-10T00:00:00Z', status: InvoiceStatus.VENCIDO, notes: 'Mensalidade de Maio/2024', collectionStage: CollectionStage.EM_NEGOCIACAO, paymentLink: '#', riskScore: 68, isAutomationActive: false },
    { id: 'inv-05', studentId: 'stud-04', schoolId: 'school-02', studentName: 'Mariana Oliveira', value: 950.00, dueDate: '2024-07-10T00:00:00Z', status: InvoiceStatus.PAGO, notes: 'Mensalidade de Julho/2024', collectionStage: CollectionStage.ACORDO_FEITO, receiptUrl: '#', riskScore: 5 },
    { id: 'inv-06', studentId: 'stud-05', schoolId: 'school-03', studentName: 'Sofia Lima', value: 890.00, dueDate: '2024-07-10T00:00:00Z', status: InvoiceStatus.VENCIDO, notes: 'Mensalidade de Julho/2024', collectionStage: CollectionStage.PAGAMENTO_RECUSADO, paymentLink: '#', riskScore: 92, isAutomationActive: true, nextAutomatedAction: { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), action: 'Notificação extrajudicial' } },
    { id: 'inv-07', studentId: 'stud-06', schoolId: 'school-02', studentName: 'Davi Oliveira', value: 950.00, dueDate: '2024-07-10T00:00:00Z', status: InvoiceStatus.PENDENTE, notes: 'Mensalidade de Julho/2024', collectionStage: CollectionStage.AGUARDANDO_CONTATO, paymentLink: '#', riskScore: 45, isAutomationActive: true, nextAutomatedAction: { date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), action: 'Lembrete amigável via WhatsApp' } },
    { id: 'inv-08', studentId: 'stud-03', schoolId: 'school-02', studentName: 'Gabriel Costa', value: 820.00, dueDate: '2024-06-10T00:00:00Z', status: InvoiceStatus.PAGO, notes: 'Mensalidade de Junho/2024', collectionStage: CollectionStage.ACORDO_FEITO, receiptUrl: '#', riskScore: 15 },
    { id: 'inv-09', studentId: 'stud-02', schoolId: 'school-01', studentName: 'Beatriz Pereira', value: 680.00, dueDate: '2024-07-10T00:00:00Z', status: InvoiceStatus.PAGO, notes: 'Mensalidade de Julho/2024', collectionStage: CollectionStage.ACORDO_FEITO, receiptUrl: '#', riskScore: 8 },
    { id: 'inv-10', studentId: 'stud-05', schoolId: 'school-03', studentName: 'Sofia Lima', value: 890.00, dueDate: '2024-06-10T00:00:00Z', status: InvoiceStatus.PAGO, notes: 'Mensalidade de Junho/2024', collectionStage: CollectionStage.ACORDO_FEITO, receiptUrl: '#', riskScore: 20 },
];

export const demoNegotiationAttempts: NegotiationAttempt[] = [
    { id: 'neg-01', invoiceId: 'inv-01', date: '2024-07-20T10:00:00Z', type: NegotiationAttemptType.ADMINISTRATIVE, channel: NegotiationChannel.WHATSAPP, notes: 'Primeiro contato via WhatsApp. Responsável visualizou e não respondeu.', author: 'Assistente Virtual' },
    { id: 'neg-02', invoiceId: 'inv-01', date: '2024-07-25T14:30:00Z', type: NegotiationAttemptType.ADMINISTRATIVE, channel: NegotiationChannel.EMAIL, notes: 'E-mail de lembrete enviado. Sem resposta até o momento.', author: 'Maria Souza' },
    { id: 'neg-03', invoiceId: 'inv-04', date: '2024-06-15T11:00:00Z', type: NegotiationAttemptType.ADMINISTRATIVE, channel: NegotiationChannel.PHONE_CALL, notes: 'Ligação realizada, responsável informou que irá verificar a situação.', author: 'João Almeida' },
    { id: 'neg-04', invoiceId: 'inv-06', date: '2024-07-18T09:00:00Z', type: NegotiationAttemptType.ADMINISTRATIVE, channel: NegotiationChannel.WHATSAPP, notes: 'Responsável informou que o cartão foi recusado e que tentará novamente.', author: 'Assistente Virtual' },
    { id: 'neg-05', invoiceId: 'inv-01', date: '2024-08-01T16:00:00Z', type: NegotiationAttemptType.JUDICIAL_PREPARATION, channel: NegotiationChannel.PETITION_GENERATED, notes: 'Petição inicial gerada via IA para início do processo judicial.', author: 'Dr. Ricardo Borges' },
    { id: 'neg-06', invoiceId: 'inv-04', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), type: NegotiationAttemptType.ADMINISTRATIVE, channel: NegotiationChannel.EMAIL, notes: 'E-mail de lembrete enviado. Sem resposta.', author: 'Sistema' },
];

export const demoPetitions: Petition[] = [
    {
        id: 'pet-01',
        invoiceId: 'inv-01',
        studentName: 'Lucas Silva',
        guardianName: 'Carlos Silva',
        schoolName: 'Escola Aprender Mais',
        generatedAt: '2024-08-01T16:00:00Z',
        status: 'draft',
        content: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SÃO PAULO - SP.

ESCOLA APRENDER MAIS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 11.222.333/0001-44, com sede na Rua das Flores, 123, São Paulo, SP, neste ato representada por seu bastante procurador que esta subscreve (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, propor a presente

AÇÃO DE COBRANÇA

em face de CARLOS SILVA, brasileiro, portador do CPF nº 111.222.333-44, residente e domiciliado na Rua das Flores, 123, São Paulo, SP, pelos fatos e fundamentos a seguir expostos.

I - DOS FATOS

O Requerido é responsável financeiro pelo aluno LUCAS SILVA, regularmente matriculado nesta instituição de ensino, conforme contrato de prestação de serviços educacionais anexo.

Ocorre que o Requerido encontra-se inadimplente com a mensalidade referente ao mês de Julho de 2024, no valor original de R$ 750,50 (setecentos e cinquenta reais e cinquenta centavos), vencida em 10/07/2024.

A Requerente buscou solucionar a pendência de forma amigável por diversas vezes, conforme histórico de contatos anexo, que demonstra tentativas via WhatsApp e E-mail, todas sem sucesso na resolução da pendência.

Desta forma, esgotadas as vias extrajudiciais, não restou alternativa senão a propositura da presente demanda.

II - DO DIREITO

(Fundamentação jurídica...)

III - DOS PEDIDOS

Diante do exposto, requer:
a) A citação do Requerido para, querendo, apresentar defesa, sob pena de revelia;
b) A total procedência da ação, condenando o Requerido ao pagamento do valor de R$ 780,00 (setecentos e oitenta reais), já atualizado, acrescido de juros e correção monetária até a data do efetivo pagamento;
c) A condenação do Requerido ao pagamento das custas processuais e honorários advocatícios.

Dá-se à causa o valor de R$ 780,00.

Nestes termos,
Pede deferimento.

São Paulo, 01 de agosto de 2024.

Dr. Ricardo Borges
OAB/SP 123.456
        `
    },
];

export const demoSubscriptions: Subscription[] = [
    { id: 'sub-01', schoolId: 'school-01', planId: PlanId.PRO, status: 'active', trialEnd: '2024-06-30T00:00:00Z', currentPeriodEnd: '2024-08-15T00:00:00Z', cycle: 'monthly' },
    { id: 'sub-02', schoolId: 'school-02', planId: PlanId.BASIC, status: 'trialing', trialEnd: '2024-08-10T00:00:00Z', currentPeriodEnd: '2024-08-10T00:00:00Z', cycle: 'monthly' },
    { id: 'sub-03', schoolId: 'school-03', planId: PlanId.PRO, status: 'past_due', trialEnd: '2024-07-01T00:00:00Z', currentPeriodEnd: '2024-08-01T00:00:00Z', cycle: 'monthly' },
];

export const demoSaasInvoices: SaasInvoice[] = [
    { id: 'saas-inv-01', schoolId: 'school-01', amount: 149.00, dueDate: '2024-07-15T00:00:00Z', createdAt: '2024-07-15T00:00:00Z', status: 'paid', invoicePdfUrl: '#' },
    { id: 'saas-inv-02', schoolId: 'school-02', amount: 99.00, dueDate: '2024-08-10T00:00:00Z', createdAt: '2024-07-10T00:00:00Z', status: 'open', invoicePdfUrl: '#' },
    { id: 'saas-inv-03', schoolId: 'school-03', amount: 149.00, dueDate: '2024-08-01T00:00:00Z', createdAt: '2024-07-01T00:00:00Z', status: 'open', invoicePdfUrl: '#' },
    { id: 'saas-inv-04', schoolId: 'school-01', amount: 149.00, dueDate: '2024-06-15T00:00:00Z', createdAt: '2024-06-15T00:00:00Z', status: 'paid', invoicePdfUrl: '#' },
    { id: 'saas-inv-05', schoolId: 'school-03', amount: 149.00, dueDate: '2024-07-01T00:00:00Z', createdAt: '2024-06-01T00:00:00Z', status: 'paid', invoicePdfUrl: '#' },
];

export const demoNotifications: Notification[] = [
    { id: 'notif-01', userId: 'user-escritorio-01', type: NotificationType.NEW_SCHOOL_CLIENT, title: 'Nova Escola Cadastrada', message: 'O Colégio Saber Viver iniciou um período de teste no plano Básico.', link: 'escolas', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }, // 2 hours ago
    { id: 'notif-02', userId: 'user-escritorio-01', type: NotificationType.SUBSCRIPTION_PAYMENT_FAILED, title: 'Falha no Pagamento', message: 'O pagamento da assinatura do Instituto Crescer falhou.', link: 'financeiro', read: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }, // 1 day ago
    { id: 'notif-03', userId: 'user-escola-01', type: NotificationType.PAYMENT_RECEIVED, title: 'Pagamento Recebido', message: 'Recebemos o pagamento de R$ 750,50 de Carlos Silva (aluno Lucas Silva).', link: 'alunos', read: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, // 2 days ago
    { id: 'notif-04', userId: 'user-escola-01', type: NotificationType.NEW_INVOICE_ASSIGNED, title: 'Nova Cobrança Atribuída', message: 'A dívida de Beatriz Pereira foi enviada para cobrança pelo escritório.', link: 'alunos', read: false, createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() }, // 5 minutes ago
];

export const demoCampaigns: Campaign[] = [
    { id: 'camp-01', officeId: 'user-escritorio-01', name: 'Volta às Aulas 2024', status: 'Concluída', target: 'Escolas de Ensino Fundamental', startDate: '2024-07-15T00:00:00Z', leadsGenerated: 8, conversionRate: 25, valueGenerated: 1980 },
    { id: 'camp-02', officeId: 'user-escritorio-01', name: 'Check-up Financeiro Meio de Ano', status: 'Ativa', target: 'Todas as escolas da base', startDate: '2024-08-01T00:00:00Z', leadsGenerated: 3, conversionRate: 33.3, valueGenerated: 1490 },
    { id: 'camp-03', officeId: 'user-escritorio-01', name: 'Expansão RJ', status: 'Planejada', target: 'Escolas de Ensino Médio (RJ)', startDate: '2024-09-01T00:00:00Z', leadsGenerated: 0, conversionRate: 0, valueGenerated: 0 },
];

const processEvents: ProcessEvent[] = [
    { id: 'evt-01', date: '2024-08-02T10:00:00Z', type: 'FILING', title: 'Petição Inicial Protocolada', description: 'Ação de cobrança distribuída para a 1ª Vara do Juizado Especial Cível.', documents: [{ name: 'Petição Inicial.pdf', url: '#' }] },
    { id: 'evt-02', date: '2024-08-10T14:00:00Z', type: 'DECISION', title: 'Despacho Inicial', description: 'Juiz determina a citação do réu para apresentar defesa no prazo de 15 dias.' },
    { id: 'evt-03', date: '2024-08-15T09:00:00Z', type: 'UPDATE', title: 'Mandado de Citação Expedido', description: 'AR enviado para o endereço do réu.' },
];

export const demoJudicialProcesses: JudicialProcess[] = [
    {
        id: 'proc-01',
        officeId: 'user-escritorio-01',
        petitionId: 'pet-01',
        studentName: 'Lucas Silva',
        schoolName: 'Escola Aprender Mais',
        processNumber: '0012345-67.2024.8.26.0001',
        status: JudicialProcessStatus.AGUARDANDO_CITACAO,
        lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        events: processEvents,
    },
    {
        id: 'proc-02',
        officeId: 'user-escritorio-01',
        petitionId: 'pet-02',
        studentName: 'Sofia Lima',
        schoolName: 'Instituto Crescer',
        processNumber: '0098765-43.2024.8.13.0024',
        status: JudicialProcessStatus.PROTOCOLADO,
        lastUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
             { id: 'evt-04', date: '2024-07-28T11:00:00Z', type: 'FILING', title: 'Petição Inicial Protocolada', description: 'Ação de execução de título extrajudicial distribuída.' }
        ],
    },
];

export const demoLiveNegotiationHistories: LiveNegotiationHistory[] = [
    {
        id: 'live-hist-01',
        studentId: 'stud-01',
        studentName: 'Lucas Silva',
        guardianName: 'Carlos Silva',
        schoolName: 'Escola Aprender Mais',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        transcript: "Advogado: Olá, Sr. Carlos, falo sobre a mensalidade de Julho.\n\nCarlos: Ah, olá. Tive um imprevisto, fica difícil pagar o valor cheio agora.\n\nAdvogado: Entendo. E se parcelarmos em 2x sem juros no cartão?",
        finalSuggestion: "O responsável parece aberto a um parcelamento. Sugira 2x de R$ 394,14. Se ele hesitar, ofereça 3x com juros baixos."
    }
];
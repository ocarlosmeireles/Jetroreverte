import { User, Invoice, Student, Guardian, School } from '../types';
import { formatCurrency, formatDate } from './formatters';

// Because we're using a CDN, jsPDF is available on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}
const { jsPDF } = window.jspdf;

// Helper to convert numbers to Portuguese words (for 1-12) to ensure cross-browser compatibility.
const numberToWord = (num: number): string => {
    const words = [
        'uma', 'duas', 'três', 'quatro', 'cinco', 'seis',
        'sete', 'oito', 'nove', 'dez', 'onze', 'doze'
    ];
    return words[num - 1] || String(num);
};


export const generateAgreementPdf = (invoice: Invoice, student: Student, guardian: Guardian, school: School, lawFirm: User) => {
    if (!invoice.agreement) {
        alert("Dados do acordo não encontrados para gerar o PDF.");
        return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let y = margin;

    // --- Header ---
    if (lawFirm.officeLogoUrl) {
        try {
            doc.addImage(lawFirm.officeLogoUrl, 'PNG', margin, y, 40, 20);
        } catch (e) {
            console.error("Could not add office logo to PDF:", e);
        }
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(lawFirm.officeName || '', pageWidth - margin, y, { align: 'right' });
    doc.text(lawFirm.officeAddress || '', pageWidth - margin, y + 5, { align: 'right' });
    doc.text(lawFirm.officePhone || '', pageWidth - margin, y + 10, { align: 'right' });
    doc.text(`OAB: ${lawFirm.oabNumber || ''}`, pageWidth - margin, y + 15, { align: 'right' });

    y += 35; // Space after header

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const addText = (text: string, options: any = {}) => {
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        if (y + (lines.length * 6) > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(lines, margin, y, options);
        y += (lines.length * 5) + 3; // Add space after each paragraph
    };

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('TERMO DE CONFISSÃO E PARCELAMENTO DE DÍVIDA', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Protocolo do Acordo: ${invoice.agreement.protocolNumber}`, pageWidth / 2, y, { align: 'center' });
    y += 12;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);


    addText(`Pelo presente instrumento particular, de um lado:`);

    doc.setFont('helvetica', 'bold');
    addText(`CREDORA: ${school.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${school.cnpj}, com sede em ${school.address}.`);

    doc.setFont('helvetica', 'normal');
    addText(`E de outro lado:`);

    doc.setFont('helvetica', 'bold');
    addText(`DEVEDOR(A): ${guardian.name}, portador(a) do CPF nº ${guardian.cpf || 'Não informado'}, residente e domiciliado(a) em ${guardian.address || 'Endereço não informado'}.`);

    doc.setFont('helvetica', 'normal');
    addText(`As partes acima identificadas têm, entre si, justo e acertado o presente Termo de Confissão e Parcelamento de Dívida, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.`);

    doc.setFont('helvetica', 'bold');
    addText(`CLÁUSULA 1ª - DO OBJETO DO CONTRATO`);
    doc.setFont('helvetica', 'normal');
    addText(`O(A) DEVEDOR(A) reconhece e confessa, por meio deste instrumento, ser devedor(a) da importância total de ${formatCurrency(invoice.updatedValue || invoice.value)}, referente a débitos de mensalidades escolares do(a) aluno(a) ${student.name}, junto à CREDORA.`);
    
    doc.setFont('helvetica', 'bold');
    addText(`CLÁUSULA 2ª - DO PARCELAMENTO`);
    doc.setFont('helvetica', 'normal');
    addText(`Para a quitação da dívida confessada na Cláusula 1ª, a CREDORA concorda em receber o valor em ${invoice.agreement.installments} (${numberToWord(invoice.agreement.installments)}) parcelas mensais e consecutivas de ${formatCurrency(invoice.agreement.installmentValue)} cada, a serem pagas via ${invoice.agreement.paymentMethod}.`);
    addText(`A primeira parcela vencerá em ${formatDate(invoice.agreement.firstDueDate)}, e as demais nos meses subsequentes, no mesmo dia.`);

    doc.setFont('helvetica', 'bold');
    addText(`CLÁUSULA 3ª - DO INADIMPLEMENTO`);
    doc.setFont('helvetica', 'normal');
    addText(`O não pagamento de qualquer uma das parcelas na data aprazada implicará no vencimento antecipado de todo o saldo devedor, sobre o qual incidirá multa de 10% (dez por cento) e juros de 1% (um por cento) ao mês, além de correção monetária, facultando à CREDORA a execução imediata do presente termo.`);

    doc.setFont('helvetica', 'bold');
    addText(`CLÁUSULA 4ª - DA ACEITAÇÃO E VALIDADE`);
    doc.setFont('helvetica', 'normal');
    addText(`O(A) DEVEDOR(A) declara estar ciente de todos os termos e condições do presente acordo. A efetivação do pagamento da primeira parcela, ou a totalidade do valor, constitui ato inequívoco de aceitação e concordância com todas as cláusulas aqui estipuladas, conferindo plena validade jurídica ao acordo, independentemente de assinatura física.`);
    addText(`Este acordo foi gerado e disponibilizado através do portal seguro da plataforma de cobrança, cujo acesso e aceite podem ser registrados eletronicamente, servindo como prova adicional da manifestação de vontade do(a) DEVEDOR(A).`);
    
    y += 10;
    addText(`E, por estarem assim justas e contratadas, firmam o presente instrumento em 2 (duas) vias de igual teor e forma.`);

    y += 15;
    addText(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));
    
    y += 20;
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(128);
    addText(`Este documento foi gerado eletronicamente pela Plataforma Jetro Reverte. A validade deste acordo é confirmada pelo pagamento da primeira parcela, conforme Cláusula 4ª.`, { align: 'center' });

    doc.save(`Acordo_${guardian.name.replace(/\s/g, '_')}.pdf`);
};
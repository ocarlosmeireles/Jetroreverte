import { User, Invoice, Student, Guardian, School } from '../types';
import { formatCurrency, formatDate } from './formatters';

// Because we're using a CDN, jsPDF is available on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}
const { jsPDF } = window.jspdf;

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
    doc.text('TERMO DE CONFISSÃO E PARCELAMENTO DE DÍVIDA', pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

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
    addText(`Para a quitação da dívida confessada na Cláusula 1ª, a CREDORA concorda em receber o valor em ${invoice.agreement.installments} (${(invoice.agreement.installments).toLocaleString('pt-BR', {style: 'spellout'})}) parcelas mensais e consecutivas de ${formatCurrency(invoice.agreement.installmentValue)} cada, a serem pagas via ${invoice.agreement.paymentMethod}.`);
    addText(`A primeira parcela vencerá em ${formatDate(invoice.agreement.firstDueDate)}, e as demais nos meses subsequentes, no mesmo dia.`);

    doc.setFont('helvetica', 'bold');
    addText(`CLÁUSULA 3ª - DO INADIMPLEMENTO`);
    doc.setFont('helvetica', 'normal');
    addText(`O não pagamento de qualquer uma das parcelas na data aprazada implicará no vencimento antecipado de todo o saldo devedor, sobre o qual incidirá multa de 10% (dez por cento) e juros de 1% (um por cento) ao mês, além de correção monetária, facultando à CREDORA a execução imediata do presente termo.`);
    
    y += 10;
    addText(`E, por estarem assim justas e contratadas, firmam o presente instrumento em 2 (duas) vias de igual teor e forma.`);

    y += 15;
    addText(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));
    
    y += 25;
    addText(`______________________________________\n${school.name}\n(CREDORA)`);
    
    y += 15;
    addText(`______________________________________\n${guardian.name}\n(DEVEDOR(A))`);

    doc.save(`Acordo_${guardian.name.replace(/\s/g, '_')}.pdf`);
};
import { User, Petition } from '../types';

// Because we're using a CDN, jsPDF is available on the window object.
declare global {
  interface Window {
    jspdf: any;
  }
}

export const generatePetitionPdf = (petition: Petition, user: User) => {
    if (typeof window.jspdf === 'undefined') {
        alert("A biblioteca para gerar PDF não foi carregada. Tente recarregar a página.");
        console.error("jsPDF is not available on window object.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = margin;

    // --- Header ---
    if (user.officeLogoUrl) {
        try {
            // Using jsPDF's internal image handling logic
            doc.addImage(user.officeLogoUrl, 'PNG', margin, yPos, 40, 20);
        } catch (e) {
            console.error("Could not add office logo to PDF:", e);
        }
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(user.officeName || '', pageWidth - margin, yPos, { align: 'right' });
    doc.text(user.officeAddress || '', pageWidth - margin, yPos + 5, { align: 'right' });
    doc.text(user.officePhone || '', pageWidth - margin, yPos + 10, { align: 'right' });
    doc.text(`OAB: ${user.oabNumber || ''}`, pageWidth - margin, yPos + 15, { align: 'right' });

    yPos += 35; // Space after header

    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- Petition Content ---
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40); // Dark gray for text
    doc.setFont('helvetica', 'normal');

    // Remove leading/trailing whitespace and split text.
    const cleanContent = petition.content.trim();
    const lines = doc.splitTextToSize(cleanContent, pageWidth - (margin * 2));
    const lineHeight = 7; 

    lines.forEach((line: string) => {
        if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
    });

    doc.save(`peticao-${petition.studentName.replace(/\s/g, '_')}-${petition.id}.pdf`);
};
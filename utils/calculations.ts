import { Invoice, InvoiceStatus } from '../types';

export const calculateUpdatedInvoiceValues = (invoice: Invoice) => {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();

    // Set time to 0 to compare dates only
    const todayAtStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueAtStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (invoice.status === InvoiceStatus.PAGO || todayAtStart <= dueAtStart) {
        return { updatedValue: invoice.value, fine: 0, interest: 0, monthsOverdue: 0 };
    }

    let months = (today.getFullYear() - dueDate.getFullYear()) * 12;
    months -= dueDate.getMonth();
    months += today.getMonth();
    
    // If today's day of the month is before the due date's day, we haven't completed a full month
    if (today.getDate() < dueDate.getDate()) {
        months--;
    }
    
    const monthsOverdue = Math.max(0, months);
    
    const originalValue = invoice.value;
    // Fine of 2%
    const fine = originalValue * 0.02;
    // Interest of 1% per month overdue
    const interest = monthsOverdue > 0 ? originalValue * 0.01 * monthsOverdue : 0;
    
    const updatedValue = parseFloat((originalValue + fine + interest).toFixed(2));
    
    return { updatedValue, fine, interest, monthsOverdue };
};
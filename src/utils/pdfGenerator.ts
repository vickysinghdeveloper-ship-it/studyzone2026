import { jsPDF } from 'jspdf';
import { Student, Payment, LibrarySettings, Visitor } from '../types';
import { generateQRCodeDataUrl } from './qrGenerator';

export async function downloadStudentCardPDF(student: Student, settings: LibrarySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [85, 120] // Standard Vertical Smart Card size
  });

  // Background Header Gradient / Navy Block
  doc.setFillColor(15, 23, 42); // Navy slate
  doc.rect(0, 0, 85, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.libraryName, 42.5, 9, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.tagline, 42.5, 14, { align: 'center' });
  doc.text(`CARD NO: ${student.studentCode}`, 42.5, 20, { align: 'center' });

  // White Card Canvas
  doc.setFillColor(248, 250, 252);
  doc.rect(4, 29, 77, 86, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(4, 29, 77, 86, 'S');

  // Student Info
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name, 42.5, 36, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Target Exam: ${student.targetExam || 'N/A'}`, 42.5, 41, { align: 'center' });

  // Details Table Box
  doc.setFontSize(7.5);
  let y = 47;
  
  const addRow = (label: string, val: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(label, 7, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(val, 28, y);
    y += 4.5;
  };

  addRow('Phone:', student.phone);
  addRow('Shift:', student.shift.toUpperCase());
  addRow('Seat No:', student.seatNumber || 'Not Assigned');
  addRow('Joined:', student.joinedDate);
  addRow('Valid Till:', student.expiryDate);
  addRow('Emergency:', student.emergencyContact || settings.phone);

  // QR Code Generation
  try {
    const qrData = JSON.stringify({
      code: student.studentCode,
      name: student.name,
      seat: student.seatNumber || 'N/A',
      phone: student.phone
    });
    const qrUrl = await generateQRCodeDataUrl(qrData);
    doc.addImage(qrUrl, 'PNG', 31, y + 1, 23, 23);
  } catch (err) {
    console.error('QR embedding error:', err);
  }

  // Footer Note & Address
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.address, 42.5, 107, { align: 'center' });
  doc.text('Non-transferable • Scan QR for Library Check-In', 42.5, 111, { align: 'center' });

  doc.save(`${student.studentCode}_ID_Card.pdf`);
}

export function downloadPaymentReceiptPDF(payment: Payment, settings: LibrarySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.libraryName, 20, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.tagline, 20, 25);
  doc.text(`${settings.address}, ${settings.city} | Ph: ${settings.phone}`, 20, 31);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE RECEIPT', 190, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${payment.receiptNumber}`, 190, 28, { align: 'right' });

  // Receipt Body Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 48, 170, 42, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT DETAILS', 26, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Student Name: ${payment.studentName}`, 26, 64);
  doc.text(`Student ID: ${payment.studentCode}`, 26, 71);
  doc.text(`Phone: ${payment.studentPhone}`, 26, 78);

  doc.text(`Date of Payment: ${payment.paymentDate}`, 110, 64);
  doc.text(`Payment Mode: ${payment.paymentMethod.toUpperCase()}`, 110, 71);
  doc.text(`Txn Ref: ${payment.transactionRef || 'N/A'}`, 110, 78);

  // Table Header
  let y = 100;
  doc.setFillColor(30, 41, 59);
  doc.rect(20, y, 170, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DESCRIPTION / PLAN', 25, y + 6);
  doc.text('AMOUNT (₹)', 185, y + 6, { align: 'right' });

  y += 9;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');

  doc.text(payment.planName, 25, y + 8);
  doc.text(`₹ ${payment.amount.toLocaleString('en-IN')}`, 185, y + 8, { align: 'right' });

  if (payment.lateFine > 0) {
    y += 10;
    doc.text('Late Fee / Fine', 25, y + 8);
    doc.text(`₹ ${payment.lateFine.toLocaleString('en-IN')}`, 185, y + 8, { align: 'right' });
  }

  if (payment.discount > 0) {
    y += 10;
    doc.setTextColor(220, 38, 38);
    doc.text('Discount Applied', 25, y + 8);
    doc.text(`- ₹ ${payment.discount.toLocaleString('en-IN')}`, 185, y + 8, { align: 'right' });
    doc.setTextColor(15, 23, 42);
  }

  y += 18;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y, 190, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET TOTAL PAID:', 120, y);
  doc.setTextColor(22, 101, 52);
  doc.text(`₹ ${payment.totalAmount.toLocaleString('en-IN')}`, 185, y, { align: 'right' });

  // Terms and Signature
  y += 30;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', 20, y);
  doc.text('1. Fees once paid are non-refundable and non-transferable.', 20, y + 5);
  doc.text('2. Please maintain quiet inside the library reading halls.', 20, y + 10);
  doc.text('3. Keep this receipt safe for attendance & ID card verification.', 20, y + 15);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Authorized Signatory`, 185, y + 10, { align: 'right' });
  doc.text(settings.libraryName, 185, y + 15, { align: 'right' });

  doc.save(`${payment.receiptNumber}.pdf`);
}

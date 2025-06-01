import { storage } from "../storage";
import { Invoice, InsertInvoice } from "@shared/schema";
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface InvoiceData {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  amount: number; // in cents
  doctorData: {
    firstName: string;
    lastName: string;
    nif: string;
    licenseNumber: string;
    fiscalAddress: string;
    fiscalCity: string;
    fiscalPostalCode: string;
  };
  patientData: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
}

export class InvoicingService {
  private generateInvoiceNumber(type: 'medical' | 'commission'): string {
    const prefix = type === 'medical' ? 'MED' : 'COM';
    const timestamp = Date.now();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Generate medical service invoice (doctor to patient, VAT exempt)
  async generateMedicalInvoice(data: InvoiceData): Promise<Invoice> {
    const invoiceData: InsertInvoice = {
      invoiceNumber: this.generateInvoiceNumber('medical'),
      type: 'medical_service',
      fromEntityType: 'doctor',
      fromEntityId: data.doctorId,
      toEntityType: 'patient',
      toEntityId: data.patientId,
      appointmentId: data.appointmentId,
      amount: data.amount,
      vatRate: 0, // Medical services are VAT exempt
      vatAmount: 0,
      totalAmount: data.amount,
      currency: 'EUR',
      description: `Consulta médica a domicilio - Dr. ${data.doctorData.firstName} ${data.doctorData.lastName}`,
      status: 'pending'
    };

    const invoice = await storage.createInvoice(invoiceData);
    
    // Generate PDF and send email
    await this.sendMedicalInvoiceEmail(invoice, data);
    
    return invoice;
  }

  // Generate platform commission invoice (platform to doctor, with VAT)
  async generateCommissionInvoice(data: InvoiceData, commissionRate: number = 15): Promise<Invoice> {
    const commissionAmount = Math.round(data.amount * (commissionRate / 100));
    const vatAmount = Math.round(commissionAmount * 0.21); // 21% VAT
    const totalAmount = commissionAmount + vatAmount;

    const invoiceData: InsertInvoice = {
      invoiceNumber: this.generateInvoiceNumber('commission'),
      type: 'platform_commission',
      fromEntityType: 'platform',
      fromEntityId: null,
      toEntityType: 'doctor',
      toEntityId: data.doctorId,
      appointmentId: data.appointmentId,
      amount: commissionAmount,
      vatRate: 21,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
      currency: 'EUR',
      description: `Comisión de intermediación - Cita #${data.appointmentId}`,
      status: 'pending'
    };

    const invoice = await storage.createInvoice(invoiceData);
    
    // Generate PDF and send email
    await this.sendCommissionInvoiceEmail(invoice, data);
    
    return invoice;
  }

  private async sendMedicalInvoiceEmail(invoice: Invoice, data: InvoiceData): Promise<void> {
    try {
      const htmlContent = this.generateMedicalInvoiceHTML(invoice, data);
      
      const msg = {
        to: data.patientData.email,
        from: 'noreply@oncallclinic.com',
        subject: `Factura de consulta médica - ${invoice.invoiceNumber}`,
        html: htmlContent,
      };

      await sgMail.send(msg);
      
      // Update invoice status
      await storage.updateInvoice(invoice.id, { 
        status: 'sent',
        sentAt: new Date()
      });

      console.log(`Medical invoice ${invoice.invoiceNumber} sent to ${data.patientData.email}`);
    } catch (error) {
      console.error('Error sending medical invoice email:', error);
      await storage.updateInvoice(invoice.id, { status: 'error' });
    }
  }

  private async sendCommissionInvoiceEmail(invoice: Invoice, data: InvoiceData): Promise<void> {
    try {
      // Get doctor email
      const doctor = await storage.getUser(data.doctorId);
      if (!doctor) throw new Error('Doctor not found');

      const htmlContent = this.generateCommissionInvoiceHTML(invoice, data);
      
      const msg = {
        to: doctor.email,
        from: 'billing@oncallclinic.com',
        subject: `Factura de comisión - ${invoice.invoiceNumber}`,
        html: htmlContent,
      };

      await sgMail.send(msg);
      
      // Update invoice status
      await storage.updateInvoice(invoice.id, { 
        status: 'sent',
        sentAt: new Date()
      });

      console.log(`Commission invoice ${invoice.invoiceNumber} sent to ${doctor.email}`);
    } catch (error) {
      console.error('Error sending commission invoice email:', error);
      await storage.updateInvoice(invoice.id, { status: 'error' });
    }
  }

  private generateMedicalInvoiceHTML(invoice: Invoice, data: InvoiceData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura Médica</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .doctor-info, .patient-info { margin-bottom: 20px; }
          .invoice-details { margin: 30px 0; }
          .total { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>FACTURA</h1>
            <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>

          <div class="doctor-info">
            <h3>Datos del Médico:</h3>
            <p><strong>${data.doctorData.firstName} ${data.doctorData.lastName}</strong></p>
            <p>NIF: ${data.doctorData.nif}</p>
            <p>Nº Colegiado: ${data.doctorData.licenseNumber}</p>
            <p>${data.doctorData.fiscalAddress}</p>
            <p>${data.doctorData.fiscalCity}, ${data.doctorData.fiscalPostalCode}</p>
          </div>

          <div class="patient-info">
            <h3>Datos del Paciente:</h3>
            <p><strong>${data.patientData.firstName} ${data.patientData.lastName}</strong></p>
            <p>${data.patientData.address}</p>
            <p>${data.patientData.city}, ${data.patientData.postalCode}</p>
          </div>

          <div class="invoice-details">
            <h3>Detalle del Servicio:</h3>
            <table width="100%" border="1" cellpadding="10" cellspacing="0">
              <tr>
                <th>Descripción</th>
                <th>Importe</th>
              </tr>
              <tr>
                <td>${invoice.description}</td>
                <td>${(invoice.amount / 100).toFixed(2)} €</td>
              </tr>
            </table>
            
            <div class="total" style="text-align: right; margin-top: 20px;">
              <p>Base Imponible: ${(invoice.amount / 100).toFixed(2)} €</p>
              <p>IVA (Exento - Servicios Sanitarios): 0,00 €</p>
              <p><strong>TOTAL: ${(invoice.totalAmount / 100).toFixed(2)} €</strong></p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Nota:</strong> Los servicios médicos están exentos de IVA según el artículo 20.1.2 de la Ley del IVA.</p>
            <p>Esta factura ha sido generada automáticamente por la plataforma OnCall Clinic como intermediario.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCommissionInvoiceHTML(invoice: Invoice, data: InvoiceData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura de Comisión</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info, .doctor-info { margin-bottom: 20px; }
          .invoice-details { margin: 30px 0; }
          .total { font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>FACTURA</h1>
            <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>

          <div class="company-info">
            <h3>OnCall Clinic S.L.</h3>
            <p>CIF: B-12345678</p>
            <p>Calle Ejemplo, 123</p>
            <p>28001 Madrid, España</p>
          </div>

          <div class="doctor-info">
            <h3>Facturar a:</h3>
            <p><strong>Dr. ${data.doctorData.firstName} ${data.doctorData.lastName}</strong></p>
            <p>NIF: ${data.doctorData.nif}</p>
            <p>${data.doctorData.fiscalAddress}</p>
            <p>${data.doctorData.fiscalCity}, ${data.doctorData.fiscalPostalCode}</p>
          </div>

          <div class="invoice-details">
            <h3>Detalle del Servicio:</h3>
            <table width="100%" border="1" cellpadding="10" cellspacing="0">
              <tr>
                <th>Descripción</th>
                <th>Base Imponible</th>
                <th>IVA (21%)</th>
                <th>Total</th>
              </tr>
              <tr>
                <td>${invoice.description}</td>
                <td>${(invoice.amount / 100).toFixed(2)} €</td>
                <td>${(invoice.vatAmount / 100).toFixed(2)} €</td>
                <td>${(invoice.totalAmount / 100).toFixed(2)} €</td>
              </tr>
            </table>
            
            <div class="total" style="text-align: right; margin-top: 20px;">
              <p>Base Imponible: ${(invoice.amount / 100).toFixed(2)} €</p>
              <p>IVA (21%): ${(invoice.vatAmount / 100).toFixed(2)} €</p>
              <p><strong>TOTAL: ${(invoice.totalAmount / 100).toFixed(2)} €</strong></p>
            </div>
          </div>

          <div class="footer">
            <p>Comisión por servicios de intermediación en la plataforma OnCall Clinic.</p>
            <p>El importe será deducido automáticamente de los honorarios de la consulta.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Process complete invoicing for an appointment
  async processAppointmentInvoicing(appointmentId: number): Promise<{ medicalInvoice: Invoice, commissionInvoice: Invoice }> {
    // Get appointment details
    const appointment = await storage.getAppointment(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    // Get patient data
    const patient = await storage.getUser(appointment.patientId);
    const patientProfile = await storage.getPatientProfileByUserId(appointment.patientId);
    if (!patient || !patientProfile) throw new Error('Patient data not found');

    // Get doctor data
    const doctor = await storage.getUser(appointment.doctorId);
    const doctorProfile = await storage.getDoctorProfileByUserId(appointment.doctorId);
    if (!doctor || !doctorProfile) throw new Error('Doctor data not found');

    // Check if doctor has complete fiscal data
    if (!doctorProfile.fiscalDataComplete || !doctorProfile.nif || !doctorProfile.fiscalAddress) {
      throw new Error('Doctor fiscal data incomplete. Cannot generate invoices.');
    }

    const invoiceData: InvoiceData = {
      appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      amount: appointment.totalAmount,
      doctorData: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        nif: doctorProfile.nif!,
        licenseNumber: doctorProfile.licenseNumber,
        fiscalAddress: doctorProfile.fiscalAddress!,
        fiscalCity: doctorProfile.fiscalCity!,
        fiscalPostalCode: doctorProfile.fiscalPostalCode!,
      },
      patientData: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        address: patientProfile.address,
        city: patientProfile.city,
        postalCode: patientProfile.postalCode,
      }
    };

    // Generate both invoices
    const medicalInvoice = await this.generateMedicalInvoice(invoiceData);
    const commissionInvoice = await this.generateCommissionInvoice(invoiceData, doctorProfile.commissionRate || 15);

    console.log(`Invoices generated for appointment ${appointmentId}: ${medicalInvoice.invoiceNumber}, ${commissionInvoice.invoiceNumber}`);

    return { medicalInvoice, commissionInvoice };
  }
}

export const invoicingService = new InvoicingService();
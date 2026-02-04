import nodemailer from 'nodemailer';

export async function createTransport() {
  if (process.env.ETHEREAL_ENABLE === 'true' || process.env.ETHEREAL_ENABLE === '1') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT || 465),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  // fallback: console logger transport
  return {
    sendMail: async (opts: any) => {
      console.log('Email fallback - would send:', opts);
      return { messageId: 'console' };
    },
  } as unknown as nodemailer.Transporter;
}

export async function sendAdminNotification(subject: string, html: string, text?: string) {
  try {
    const transporter = await createTransport();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@findinghealth.local',
      to: process.env.ADMIN_EMAIL || 'nedcaffarra@yahoo.com',
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });

    if ((info as any).messageId && (nodemailer as any).getTestMessageUrl) {
      const url = nodemailer.getTestMessageUrl(info as any);
      console.log('Preview URL:', url);
    }
  } catch (err) {
    console.error('Failed sending admin email', err);
  }
}

import nodemailer from 'nodemailer';

export class EmailChannel {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '1025', 10),
            secure: false,
            // In development, use MailHog or similar local SMTP
            // In production, configure real SMTP credentials
            ...(process.env.SMTP_USER && {
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            }),
        });
    }

    async send(to: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Collector.shop" <noreply@collector.shop>',
            to,
            subject,
            html: this.buildHtmlTemplate(subject, body),
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`[Email] Sent to ${to}: ${subject}`);
    }

    private buildHtmlTemplate(title: string, content: string): string {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 30px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px; }
            .header h1 { margin: 0; font-size: 20px; }
            .content { color: #333; line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Marketplace</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${content}</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par Marketplace.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}

import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { createTransport } from './email';
import { runSingle, runInsert, runQuery } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      // server is unused because we override sendVerificationRequest
      server: process.env.EMAIL_SERVER ?? undefined,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider, token, baseUrl }) {
        try {
          const transporter = await createTransport();
          const result = await transporter.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to Finding Health`,
            html: `<p>Sign in to Finding Health:</p><p><a href="${url}">Click here to sign in</a></p>`,
            text: `Sign in: ${url}`,
          });
          if ((result as any).messageId && (typeof (require('nodemailer')).getTestMessageUrl === 'function')) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const nodemailer = require('nodemailer');
            const preview = nodemailer.getTestMessageUrl(result as any);
            console.log('Preview URL:', preview);
          }
        } catch (err) {
          console.error('Error sending verification email', err);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // ensure user exists in our users table
      try {
        if (!user?.email) return false;
        const existing = runSingle('SELECT * FROM users WHERE email = ?', [user.email]);
        const now = Date.now();
        if (!existing) {
          // create a lightweight user; admin seeding handled separately
          const id = (Date.now().toString(36) + Math.random().toString(36).slice(2));
          runInsert('INSERT INTO users (id, email, first_name, last_name, created_at, role) VALUES (?, ?, ?, ?, ?, ?)', [id, user.email, '', '', now, 'USER']);
        }
      } catch (err) {
        console.error('signIn callback error:', err);
      }
      return true;
    },
    async session({ session, token, user }) {
      try {
        if (session?.user?.email) {
          const dbUser = runSingle('SELECT * FROM users WHERE email = ?', [session.user.email]);
          if (dbUser) {
            // attach role and names
            (session.user as any).role = dbUser.role;
            (session.user as any).firstName = dbUser.first_name;
            (session.user as any).lastName = dbUser.last_name;
            (session.user as any).needsProfile = !(dbUser.first_name && dbUser.last_name);
          }
        }
      } catch (err) {
        console.error('session callback error', err);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};

export default NextAuth(authOptions);

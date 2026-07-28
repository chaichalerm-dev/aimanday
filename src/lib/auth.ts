import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// ค่า config หลักของ NextAuth — ใช้ JWT strategy ล้วน (ไม่มี DB session/adapter)
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // ตรวจ email + password ตอน login (NextAuth เรียกให้เองเมื่อ signIn('credentials', ...))
      // รับ credentials จากฟอร์ม คืน user object ถ้าถูกต้อง หรือ null ถ้าไม่ผ่าน (NextAuth แปลงเป็น error ให้)
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // normalize email เป็น lowercase ก่อนค้น (กันเคส Email@X.com ไม่ match email@x.com ที่ตอนสมัคร normalize ไว้)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });
        if (!user) return null;

        // เทียบรหัสผ่านที่ผู้ใช้กรอกกับ hash ที่เก็บไว้ (bcrypt เทียบแบบ one-way ไม่ decrypt กลับ)
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? user.email };
      },
    }),
  ],
  callbacks: {
    // เรียกทุกครั้งที่สร้าง/อ่าน JWT — ใส่ user.id ลง token ตอน login ครั้งแรก
    // และรับค่าที่อัปเดตจาก useSession().update() ฝั่ง client (trigger === 'update')
    async jwt({ token, user, trigger, session }) {
      if (user) token.id = user.id;
      // Client called useSession().update({...}) after editing the profile —
      // patch the token so the new name/email show up without a full re-login.
      if (trigger === 'update' && session) {
        if (typeof session.name === 'string') token.name = session.name;
        if (typeof session.email === 'string') token.email = session.email;
      }
      return token;
    },
    // แปลง JWT token ให้เป็น session object ที่ฝั่ง client เรียกผ่าน useSession()/getServerSession()
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
};

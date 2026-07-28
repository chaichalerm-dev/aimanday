import type { DefaultSession } from 'next-auth';

// Module augmentation — เพิ่ม field "id" เข้าไปใน type ของ next-auth ที่ไม่มีให้โดย default
// ถ้าไม่มีไฟล์นี้ TypeScript จะ error ตอนเรียก session.user.id / token.id เพราะ type เดิมไม่รู้จัก field นี้
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

import type { MaybeBilingual } from '@/lib/bilingual';
import type { Module } from '@/lib/analyzer';

// รูปแบบ 1 รายการประวัติที่ frontend ใช้ — ตรงกับ shape ที่ /api/history และ /api/history/[id] คืนกลับมา
export interface HistoryItem {
  id: string;
  audioName: string;
  transcript: string;
  sow: MaybeBilingual[];
  mandayMin: number;
  mandayMax: number;
  modules: Module[];
  assumptions: MaybeBilingual[];
  createdAt: string;
}

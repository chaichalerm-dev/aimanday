import type { MaybeBilingual } from '@/lib/bilingual';
import type { Module } from '@/lib/analyzer';

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

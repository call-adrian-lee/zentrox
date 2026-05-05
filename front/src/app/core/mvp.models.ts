export type MvpStatus = 'draft' | 'published';

export interface MvpItem {
  id: number;
  name: string;
  focus: string;
  stage: string;
  status: MvpStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

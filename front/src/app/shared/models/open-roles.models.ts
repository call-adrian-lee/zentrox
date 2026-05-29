/** Public open roles and applications (DB: `jobs`, `job_applications`). */

export type OpenRoleStatus = 'draft' | 'published';

export interface OpenRole {
  id: number;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  status?: OpenRoleStatus;
  created_at?: string;
  updated_at?: string;
}

export interface OpenRoleApplicationRow {
  id: number;
  role_id: number;
  role_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
}

export interface OpenRoleApplyPayload {
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

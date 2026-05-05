export type JobStatus = 'draft' | 'published';

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationRow {
  id: number;
  job_id: number;
  job_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
}

export interface JobApplyPayload {
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

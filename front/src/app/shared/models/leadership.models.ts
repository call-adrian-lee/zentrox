export type PublishStatus = 'draft' | 'published';

/** Fields exposed by the public `GET /api/leadership` endpoint (homepage cards). */
export interface LeadershipMemberPublic {
  id: number;
  /** Display name (person or open-seat label). */
  name: string;
  role_title: string;
  blurb: string;
  /** Stored token `leadership-{id}` or full URL; UI maps to `/img/leadership/leadership-{id}.png`. */
  photo_path: string | null;
  sort_order: number;
}

/** Full row returned by admin leadership APIs. */
export interface LeadershipMember extends LeadershipMemberPublic {
  badge_label: string | null;
  card_aria: string | null;
  cta_label: string | null;
  cta_aria: string | null;
  cta_path: string | null;
  open_seat: number;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
}

export { leadershipPhotoUrl } from '@core/site-images';

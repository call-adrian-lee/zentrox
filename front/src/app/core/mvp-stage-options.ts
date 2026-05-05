/** Allowed MVP lifecycle stages (admin dropdown + API validation). */
export const MVP_STAGE_OPTIONS = [
  'Discovery',
  'Research & planning',
  'Design',
  'Prototyping',
  'Development',
  'Integration',
  'Alpha',
  'Beta',
  'Pilot',
  'Production',
  'Maintenance',
  'Paused',
  'Sunset'
] as const;

export type MvpStageOption = (typeof MVP_STAGE_OPTIONS)[number];

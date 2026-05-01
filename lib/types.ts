export type Profile = {
  id: string
  name: string
  institution: string
  specialty: string
  points: number
  created_at: string
}

export type Form = {
  id: string
  user_id: string
  title: string
  description: string
  link: string
  institution: string
  specialty: string
  estimated_minutes: number
  fill_count: number
  is_active: boolean
  created_at: string
}

export type FormFeedItem = {
  id: string
  title: string
  description: string
  link: string
  institution: string
  specialty: string
  estimated_minutes: number
  fill_count: number
  created_at: string
  user_id: string
  submitter_name: string
  submitter_institution: string
  submitter_points: number
}

export type Fill = {
  id: string
  user_id: string
  form_id: string
  filled_at: string
}

export const SPECIALTIES = [
  'General Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Internal Medicine',
  'Emergency Medicine',
  'Family Medicine',
  'Radiology',
  'Pathology',
  'Pharmacology',
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Microbiology',
  'Public Health',
  'Other',
]

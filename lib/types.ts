export type Profile = {
  id: string
  name: string
  institution: string
  specialty: string
  points: number
  age: number | null
  sex: string
  country: string
  role: string
  created_at: string
}

export type SampleCriteria = {
  roles: string[]
  sex: string        // 'any' | 'male' | 'female'
  min_age: number | null
  max_age: number | null
  countries: string[]
  other: string
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
  sample_criteria: SampleCriteria
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
  sample_criteria: SampleCriteria | null
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

// ── Specialties (grouped for display, flat for storage) ───────
export const SPECIALTY_GROUPS: Record<string, string[]> = {
  'Medicine & Health': [
    'General Medicine', 'Surgery', 'Internal Medicine', 'Pediatrics',
    'Obstetrics & Gynecology', 'Psychiatry', 'Emergency Medicine',
    'Family Medicine', 'Radiology', 'Pathology', 'Pharmacology',
    'Anatomy', 'Physiology', 'Biochemistry', 'Microbiology',
    'Public Health', 'Dentistry', 'Nursing', 'Pharmacy',
  ],
  'Science': [
    'Biology', 'Chemistry', 'Physics', 'Environmental Science',
  ],
  'Technology': [
    'Computer Science', 'Software Engineering', 'Information Technology', 'Data Science',
  ],
  'Engineering': [
    'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering',
  ],
  'Social Sciences': [
    'Psychology', 'Sociology', 'Political Science', 'Economics', 'Anthropology',
  ],
  'Humanities': [
    'History', 'Philosophy', 'Literature', 'Linguistics', 'Arts',
  ],
  'Business': [
    'Business Administration', 'Marketing', 'Finance', 'Accounting', 'Management',
  ],
  'Education & Law': [
    'Education', 'Special Education', 'Law', 'Criminology',
  ],
  'Other': ['Other'],
}

export const SPECIALTIES = Object.values(SPECIALTY_GROUPS).flat()

// ── Target population roles ───────────────────────────────────
export const ROLES: { value: string; label: string }[] = [
  { value: 'medical_student',   label: 'Medical Student' },
  { value: 'intern',            label: 'Intern / House Officer' },
  { value: 'resident',          label: 'Resident' },
  { value: 'doctor',            label: 'Doctor / Physician' },
  { value: 'nurse',             label: 'Nurse' },
  { value: 'pharmacist',        label: 'Pharmacist' },
  { value: 'dentist',           label: 'Dentist' },
  { value: 'university_student',label: 'University Student (General)' },
  { value: 'high_school',       label: 'High School Student' },
  { value: 'parent',            label: 'Parent' },
  { value: 'healthcare_worker', label: 'Healthcare Worker (General)' },
  { value: 'patient',           label: 'Patient' },
  { value: 'employee',          label: 'Employee / Working Adult' },
  { value: 'general_public',    label: 'General Public' },
  { value: 'other',             label: 'Other' },
]

export function roleLabel(value: string) {
  return ROLES.find(r => r.value === value)?.label ?? value
}

/** Returns true if a user profile matches a form's sample criteria */
export function matchesCriteria(criteria: SampleCriteria | null | undefined, profile: Partial<Profile>): boolean {
  if (!criteria) return true

  // Role
  if (criteria.roles?.length > 0 && profile.role) {
    if (!criteria.roles.includes(profile.role)) return false
  }

  // Sex
  if (criteria.sex && criteria.sex !== 'any' && profile.sex && profile.sex !== '') {
    if (criteria.sex !== profile.sex) return false
  }

  // Age
  if (profile.age) {
    if (criteria.min_age != null && profile.age < criteria.min_age) return false
    if (criteria.max_age != null && profile.age > criteria.max_age) return false
  }

  // Country
  if (criteria.countries?.length > 0 && profile.country) {
    const userCountry = profile.country.toLowerCase()
    if (!criteria.countries.some(c => c.toLowerCase() === userCountry)) return false
  }

  return true
}

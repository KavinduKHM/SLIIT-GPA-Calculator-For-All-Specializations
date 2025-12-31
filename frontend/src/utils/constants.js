export const GRADE_OPTIONS = [
  { value: 'A+', label: 'A+ (4.0)', points: 4.0 },
  { value: 'A', label: 'A (4.0)', points: 4.0 },
  { value: 'A-', label: 'A- (3.7)', points: 3.7 },
  { value: 'B+', label: 'B+ (3.3)', points: 3.3 },
  { value: 'B', label: 'B (3.0)', points: 3.0 },
  { value: 'B-', label: 'B- (2.7)', points: 2.7 },
  { value: 'C+', label: 'C+ (2.3)', points: 2.3 },
  { value: 'C', label: 'C (2.0)', points: 2.0 },
  { value: 'C-', label: 'C- (1.7)', points: 1.7 },
  { value: 'D+', label: 'D+ (1.3)', points: 1.3 },
  { value: 'D', label: 'D (1.0)', points: 1.0 },
  { value: 'E', label: 'E/F (0.0)', points: 0.0 },
];

export const GRADE_COLORS = {
  'A+': 'chip--emerald',
  'A': 'chip--emerald',
  'A-': 'chip--emeraldSoft',
  'B+': 'chip--azure',
  'B': 'chip--azure',
  'B-': 'chip--azureSoft',
  'C+': 'chip--amber',
  'C': 'chip--amber',
  'C-': 'chip--amberSoft',
  'D+': 'chip--warning',
  'D': 'chip--warning',
  'E': 'chip--danger',
  'F': 'chip--danger',
};

export const GPA_COLORS = {
  '3.7-4.0': 'score--emerald',
  '3.3-3.69': 'score--azure',
  '3.0-3.29': 'score--amber',
  '2.0-2.99': 'score--warning',
  '0-1.99': 'score--danger',
};
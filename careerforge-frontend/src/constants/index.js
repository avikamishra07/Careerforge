export const ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'Product Manager',
  'UI/UX Designer', 'DevOps Engineer', 'Mobile Developer', 'Security Engineer',
]

export const SKILLS = [
  'React', 'Vue.js', 'Node.js', 'Python', 'TypeScript', 'Java',
  'Go', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'MongoDB',
  'PostgreSQL', 'Redis', 'GraphQL', 'FastAPI', 'Django', 'Flutter',
  'TensorFlow', 'PyTorch', 'Figma', 'Git', 'CI/CD', 'Linux', 'Rust',
]

export const NAV_ITEMS = [
  { id: 'dashboard',  icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { id: 'interview',  icon: 'ti-microphone',        label: 'AI Interview' },
  { id: 'resume',     icon: 'ti-file-text',          label: 'Resume' },
  { id: 'team',       icon: 'ti-users-group',        label: 'Team Match' },
  { id: 'skillswap',  icon: 'ti-arrows-exchange',    label: 'SkillSwap' },
  null,
  { id: 'history',    icon: 'ti-history',            label: 'History' },
  { id: 'profile',    icon: 'ti-user',               label: 'Profile' },
]

export const C = {
  bg: '#07070b', surface: '#0c0c15', card: '#10101a', card2: '#131320',
  border: 'rgba(255,255,255,.08)', text: '#e8e8f0', muted: '#62627a', faint: '#3a3a50',
  indigo: '#6366f1', indigoL: '#818cf8',
  indigoA: 'rgba(99,102,241,.13)', indigoB: 'rgba(99,102,241,.06)',
  green: '#10b981', greenA: 'rgba(16,185,129,.12)',
  amber: '#f59e0b', amberA: 'rgba(245,158,11,.12)',
  red: '#ef4444', redA: 'rgba(239,68,68,.13)',
  blue: '#3b82f6', blueA: 'rgba(59,130,246,.12)',
}

export const scoreColor = (v) =>
  v >= 80 ? C.green : v >= 60 ? C.amber : C.red

export const fmtTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

// Storage utility — localStorage wrapper (swap with Supabase later)

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  grade: string;
  subject: string;
  fileData: string; // base64 for demo
  fileName: string;
  uploadDate: string;
}

export type UploadedFile = {
  key: string;
  label: string;
  fileName: string;
  mimeType: string;
  dataUrl: string; // base64
};

export type SubjectMark = {
  subject: string;
  mark: number; // 0-100
};

export interface Application {
  id: string;

  // Learner
  firstName: string;
  lastName: string;
  dob: string;
  gender?: string;
  grade: string;
  year: string;

  // Generated
  studentNumber: string;

  // Parent / Guardian
  guardianName: string;
  guardianRelationship?: string;
  guardianPhone: string;
  guardianEmail: string;

  // Address
  address: string;
  locality: string;

  // School history
  previousSchool: string;
  lastGradeCompleted?: string;

  // Notes
  medicalInfo?: string;

  // Boarding
  applicationType: 'General' | 'Boarding';
  boardingType?: string;

  // Uploads
  uploads: UploadedFile[];

  // Academic report capture (manual entry for now)
  subjectMarks: SubjectMark[];
  averageMark: number;

  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  submittedDate: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  monThu: string;
  friday: string;
  weekend: string;
}

export interface AboutInfo {
  historyParagraphs: string[];
  principalName: string;
  principalTitle: string;
  principalMessage: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
}

export interface AchieverEntry {
  id: string;
  name: string;
  achievement: string;
  image: string;
}

export interface HallOfFameEntry {
  id: string;
  name: string;
  title: string;
  year: string;
  desc: string;
  image: string;
}

export interface YearResults {
  overall: number;
  bachelor: number;
  bachelorRate: number;
  distinctions: number;
  wrote: number;
  subjects: { subject: string; rate: number }[];
}

function getItems<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function getObject<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setObject<T>(key: string, obj: T): void {
  localStorage.setItem(key, JSON.stringify(obj));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, '0');
}

export function generateStudentNumber(year: string): string {
  // Example: 2027-000123
  const key = `admin_student_counter_${year}`;
  const current = Number(localStorage.getItem(key) || '0');
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return `${year}-${padNumber(next, 6)}`;
}

export function calculateAverageMark(subjectMarks: SubjectMark[]): number {
  if (!subjectMarks || subjectMarks.length === 0) return 0;
  const total = subjectMarks.reduce((sum, s) => sum + (Number.isFinite(s.mark) ? s.mark : 0), 0);
  return Math.round((total / subjectMarks.length) * 10) / 10;
}

// News
const defaultNews: NewsItem[] = [
  {
    id: '1',
    title: '2027 Applications Open',
    date: 'Now open',
    content:
      'Applications for admissions and boarding for the 2027 academic year are now open. Please submit your application using the online forms.',
    image: '',
  },
];
export const getNews = () => (getItems<NewsItem>('admin_news').length ? getItems<NewsItem>('admin_news') : defaultNews);
export const setNews = (items: NewsItem[]) => setItems('admin_news', items);

// Documents
export const getDocuments = () => getItems<DocumentItem>('admin_documents');
export const setDocuments = (items: DocumentItem[]) => setItems('admin_documents', items);

// Applications
export const getApplications = () => getItems<Application>('admin_applications');
export const setApplications = (items: Application[]) => setItems('admin_applications', items);

// Contact
const defaultContact: ContactInfo = {
  address: 'Sigoga Location, Mgubo A/A, Matatiele, 4730 (Eastern Cape)',
  phone: '+27 76 707 3212',
  email: 'office@mounthargreavesss.co.za',
  monThu: '07:30 - 15:30',
  friday: '07:30 - 13:30',
  weekend: 'Closed',
};
export const getContact = () => getObject<ContactInfo>('admin_contact', defaultContact);
export const setContact = (info: ContactInfo) => setObject('admin_contact', info);

// About
const defaultAbout: AboutInfo = {
  historyParagraphs: [
    'Mount Hargreaves Senior Secondary School is a public boarding school serving learners in and around Sigoga Location (Matatiele, Eastern Cape).',
    'The school is committed to disciplined learning, community values, and strong academic outcomes.',
    'Parents and guardians are encouraged to engage with the school through meetings, events, and ongoing learner support.',
  ],
  principalName: 'Ms Ngozwana',
  principalTitle: 'Principal',
  principalMessage: [
    'Welcome to Mount Hargreaves Senior Secondary School. We believe every learner can achieve with consistent effort, good support, and a strong learning environment.',
    'We value respect, responsibility, and pride in our school community. Together we can build a culture of achievement.',
  ],
};
export const getAbout = () => getObject<AboutInfo>('admin_about', defaultAbout);
export const setAbout = (info: AboutInfo) => setObject('admin_about', info);

// Activities
const defaultActivities: Activity[] = [
  { id: '1', name: 'Soccer', category: 'Sport', description: 'Training and competition at school and district level.', image: '' },
  { id: '2', name: 'Netball', category: 'Sport', description: 'Competitive teams across age groups.', image: '' },
  { id: '3', name: 'Athletics', category: 'Sport', description: 'Track and field development and competition.', image: '' },
  { id: '4', name: 'Debating', category: 'Academic', description: 'Building critical thinking and communication skills.', image: '' },
  { id: '5', name: 'Choir', category: 'Culture', description: 'Music and performance for school events and competitions.', image: '' },
];
export const getActivities = () => (getItems<Activity>('admin_activities').length ? getItems<Activity>('admin_activities') : defaultActivities);
export const setActivities = (items: Activity[]) => setItems('admin_activities', items);

// Achievers by year
export const getAchieversByYear = (year: string) => getItems<AchieverEntry>(`admin_achievers_${year}`);
export const setAchieversByYear = (year: string, items: AchieverEntry[]) => setItems(`admin_achievers_${year}`, items);

// Hall of Fame
const defaultHall: HallOfFameEntry[] = [
  { id: '1', name: 'Top Achiever 1', title: 'Top Achiever', year: '2025', desc: '', image: '' },
  { id: '2', name: 'Top Achiever 2', title: 'Top Achiever', year: '2025', desc: '', image: '' },
  { id: '3', name: 'Top Achiever 3', title: 'Top Achiever', year: '2025', desc: '', image: '' },
];
export const getHallOfFame = () =>
  getItems<HallOfFameEntry>('admin_hall_of_fame').length ? getItems<HallOfFameEntry>('admin_hall_of_fame') : defaultHall;
export const setHallOfFame = (items: HallOfFameEntry[]) => setItems('admin_hall_of_fame', items);

// Results by year
const defaultResults: Record<string, YearResults> = {
  '2025': {
    overall: 94.5,
    bachelor: 206,
    bachelorRate: 71.8,
    distinctions: 451,
    wrote: 287,
    subjects: [
      { subject: 'Accounting', rate: 90.6 },
      { subject: 'Mathematics', rate: 71.1 },
      { subject: 'Physical Sciences', rate: 82.1 },
    ],
  },
  '2024': {
    overall: 94.0,
    bachelor: 0,
    bachelorRate: 0,
    distinctions: 0,
    wrote: 0,
    subjects: [
      { subject: 'English FAL', rate: 100 },
      { subject: 'Life Orientation', rate: 100 },
    ],
  },
  '2023': {
    overall: 92.1,
    bachelor: 0,
    bachelorRate: 0,
    distinctions: 0,
    wrote: 0,
    subjects: [
      { subject: 'Life Orientation', rate: 100 },
      { subject: 'Geography', rate: 93.5 },
    ],
  },
};
export const getResultsByYear = (year: string) =>
  getObject<YearResults | null>(`admin_results_${year}`, defaultResults[year] || null);
export const setResultsByYear = (year: string, data: YearResults) => setObject(`admin_results_${year}`, data);

// Auth
export const isAuthenticated = () => localStorage.getItem('admin_auth') === 'true';
export const login = (password: string): boolean => {
  if (password === 'admin2026') {
    localStorage.setItem('admin_auth', 'true');
    return true;
  }
  return false;
};
export const logout = () => localStorage.removeItem('admin_auth');

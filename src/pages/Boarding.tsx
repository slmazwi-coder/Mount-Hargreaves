import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, Upload, X, ChevronLeft, ChevronRight,
  AlertCircle, Download, FileText, BedDouble, Info,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import {
  generateId,
  generateStudentNumber,
  getApplications,
  setApplications,
  type Application,
  type UploadedFile,
} from '../admin/utils/storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() { return new Date().toISOString().slice(0, 10); }

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(String(r.result));
    r.onerror = () => rej(new Error('Failed to read file'));
    r.readAsDataURL(file);
  });
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────

const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-school-green/40 focus:border-school-green transition w-full bg-white';
const sel = inp + ' cursor-pointer';

const Field = ({ label, required, children, className = '' }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const SectionHeading = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 pb-2 border-b-2 border-school-green/20 mb-5">
    <FileText size={15} className="text-school-green shrink-0" />
    <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">{title}</h3>
  </div>
);

const StepBadge = ({ num, label, active, done }: {
  num: number; label: string; active: boolean; done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all
      ${done ? 'bg-school-green border-school-green text-white'
      : active ? 'bg-white border-white text-school-green'
      : 'bg-white/20 border-white/30 text-white/60'}`}>
      {done ? <CheckCircle size={14} /> : num}
    </div>
    <span className={`text-xs font-bold uppercase tracking-widest transition-all
      ${active ? 'text-white' : done ? 'text-green-200' : 'text-white/50'}`}>
      {label}
    </span>
  </div>
);

const FileUploadRow = ({ label, required, fileKey, files, onChange }: {
  label: string; required?: boolean; fileKey: string;
  files: Record<string, File | null>;
  onChange: (key: string, file: File | null) => void;
}) => {
  const file = files[fileKey];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition
      ${file ? 'border-school-green bg-green-50'
      : required ? 'border-dashed border-red-300 bg-red-50/30'
      : 'border-dashed border-gray-300 bg-gray-50'}`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        ${file ? 'bg-school-green text-white' : 'bg-gray-200 text-gray-400'}`}>
        {file ? <CheckCircle size={16} /> : <Upload size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-700 leading-tight">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className={`text-xs mt-0.5 truncate ${file ? 'text-school-green' : 'text-gray-400'}`}>
          {file ? file.name : 'No file chosen'}
        </div>
      </div>
      <label className="shrink-0 text-xs font-bold text-school-green cursor-pointer hover:underline">
        {file ? 'Change' : 'Upload'}
        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={e => onChange(fileKey, e.target.files?.[0] ?? null)} />
      </label>
      {file && (
        <button type="button" onClick={() => onChange(fileKey, null)}
          className="shrink-0 text-gray-400 hover:text-red-500">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Declaration PDF generator (simple HTML → download) ──────────────────────

function downloadDeclarationForm(parentName: string, year: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>HTL 03 – Boarding Bursary Declaration</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12pt; margin: 40px; line-height: 1.6; color: #111; }
  h2 { text-align:center; text-decoration:underline; }
  .label { font-weight:bold; }
  .line { border-bottom: 1px solid #000; display:inline-block; min-width:200px; }
  .sig-block { margin-top:40px; display:flex; gap:80px; }
  .sig-col { flex:1; }
  .sig-col .line { width:100%; display:block; margin-top:30px; }
  .stamp-box { border:1px solid #000; width:200px; height:100px; margin:20px 0; display:flex; align-items:center; justify-content:center; color:#aaa; font-size:10pt; }
  p { margin: 8px 0; }
  .section { margin: 24px 0; }
  @media print { body { margin: 20mm; } }
</style>
</head>
<body>
  <p style="text-align:right"><strong>HTL 03</strong></p>
  <p><strong>Province of the Eastern Cape – DEPARTMENT OF EDUCATION</strong><br/>
  Steve Vukile Tshwete Education Complex * Zone 6* Zwelitsha * Private Bag X0032 * Bhisho * 5605<br/>
  Tel: +27 (0)40 608 4342/4042 &nbsp; Fax: 040-6084485</p>
  <hr/>

  <h2>APPLICATION FOR A BOARDING BURSARY FOR THE YEAR: ${year}</h2>

  <div class="section">
    <p><strong>7. DECLARATION BY PARENT / GUARDIAN</strong></p>
    <p>I (Surname and full name(s)): <span class="line">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
    <p>hereby solemnly declare that I, without the assistance for which I am applying, will not be in a position to provide for the education of the child(ren) mentioned in paragraph 4 and that I have not withheld any information regarding my circumstances and that all information given on this application form is correct. I accept that if at any stage it is established that the information given by me is incorrect, all financial assistance will be withdrawn and the amount of such assistance already paid to me, shall be recovered from me.</p>

    <div class="sig-block">
      <div class="sig-col">
        <p class="label">SURNAME &amp; NAME</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">SIGNATURE</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">DATE</p>
        <div class="line"></div>
      </div>
    </div>

    <p style="margin-top:20px">The declarer hereby pledges that he/she is fully conversant with the contents of this declaration and understands it.</p>
    <p>SWORN BEFORE ME AT _________________________ ON THE ______ DAY OF _____________ YEAR _______</p>

    <div class="stamp-box">OFFICIAL STAMP</div>

    <div class="sig-block">
      <div class="sig-col">
        <p class="label">COMMISSIONER OF OATHS</p>
        <div class="line"></div>
      </div>
      <div class="sig-col">
        <p class="label">DATE</p>
        <div class="line"></div>
      </div>
    </div>
  </div>

  <hr/>
  <p style="font-size:10pt;color:#555;margin-top:30px">
    <strong>Instructions:</strong> Print this form. Take it to your nearest Police Station or Commissioner of Oaths. 
    Sign in their presence. Have it stamped with the official stamp. Scan or photograph the completed form and 
    upload it back on the online application portal.
  </p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `HTL03_Declaration_${parentName || 'Form'}_${year}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Boarding = () => {
  const [step,       setStep]       = useState<1 | 2 | 3>(1);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [files,      setFiles]      = useState<Record<string, File | null>>({});
  const [undertaking, setUndertaking] = useState(false);

  // ── HTL 02 – Section 1: Learner details ─────────────────────────────────

  const [learner, setL] = useState({
    surnameAndName: '',
    homeAddress: '',
    schoolNameAndAddress: '',
    currentGrade: '',
    gender: '',
    healthStatus: 'good' as 'good' | 'fair' | 'bad',
    healthProblems: '',
    idNumber: '',
    age: '',
    distanceHomeToSchool: '',
    year: new Date().getFullYear().toString(),
    admissionNo: '',
    medicalAidName: '',
    medicalAidNumber: '',
    allergiesAndDietaryInfo: '',
  });

  // ── HTL 02 – Section 8: Parent/Guardian table ────────────────────────────

  const [father, setFather] = useState({
    surname: '', name: '', relationship: '', homeAddress: '',
    telHome: '', telWork: '', cellphone: '',
    nameOfEmployer: '', addressOfEmployer: '', occupation: '', salaryIncome: '',
  });

  const [mother, setMother] = useState({
    surname: '', name: '', relationship: '', homeAddress: '',
    telHome: '', telWork: '', cellphone: '',
    nameOfEmployer: '', addressOfEmployer: '', occupation: '', salaryIncome: '',
  });

  const [doctor, setDoctor] = useState({
    name: '', telephone: '', address: '',
  });

  // ── HTL 03 – Bursary form ────────────────────────────────────────────────

  const [guardian, setGuardian] = useState({
    surname: '', fullNames: '',
    postalAddress: '', postalCode: '',
    homeAddress: '', homeCode: '',
    telHome: '', telHomeCode: '',
    telWork: '', telWorkCode: '',
    gender: '', maritalStatus: '',
    surnameDiffersReason: '',
  });

  // Children for bursary (up to 4 rows)
  const [children, setChildren] = useState([
    { surname: '', firstName: '', dob: '', grade: '', school: '' },
    { surname: '', firstName: '', dob: '', grade: '', school: '' },
  ]);

  const [otherChildren, setOtherChildren] = useState([
    { surname: '', firstName: '', dob: '', reason: '' },
    { surname: '', firstName: '', dob: '', reason: '' },
  ]);

  // Income details
  const [income, setIncome] = useState({
    motherEmployer: '', motherEmployerTel: '', motherIncomeType: '', motherGrossIncome: '',
    fatherEmployer: '', fatherEmployerTel: '', fatherIncomeType: '', fatherGrossIncome: '',
    guardianEmployer: '', guardianEmployerTel: '', guardianIncomeType: '', guardianGrossIncome: '',
  });

  // Distances
  const [distances, setDistances] = useState({
    distanceToAppliedSchool: '',
    nearestSchoolName: '',
    nearestSchoolDistance: '',
    nearestHostelSchoolName: '',
    nearestHostelSchoolDistance: '',
    reasonNotAttendingNearest: '',
    bursaryRequiredFrom: '',
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const patchL   = (k: string, v: string) => setL(p => ({ ...p, [k]: v }));
  const patchF   = (k: string, v: string) => setFather(p => ({ ...p, [k]: v }));
  const patchM   = (k: string, v: string) => setMother(p => ({ ...p, [k]: v }));
  const patchD   = (k: string, v: string) => setDoctor(p => ({ ...p, [k]: v }));
  const patchG   = (k: string, v: string) => setGuardian(p => ({ ...p, [k]: v }));
  const patchInc = (k: string, v: string) => setIncome(p => ({ ...p, [k]: v }));
  const patchDis = (k: string, v: string) => setDistances(p => ({ ...p, [k]: v }));

  const patchChild = (i: number, k: string, v: string) =>
    setChildren(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const patchOtherChild = (i: number, k: string, v: string) =>
    setOtherChildren(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

  const handleFileChange = (key: string, file: File | null) =>
    setFiles(p => ({ ...p, [key]: file }));

  // Required uploads per step
  const htl02RequiredUploads = [
    { key: 'salaryAdviceFather', label: 'Salary Advice – Father/Guardian (compulsory)', required: true },
    { key: 'salaryAdviceMother', label: 'Salary Advice – Mother/Relative (if applicable)' },
  ];

  const htl03RequiredUploads = [
    { key: 'incomeProof',     label: 'Proof of Gross Family Income (salary slip / employer statement)', required: true },
    { key: 'pensionProof',    label: 'Proof of Pension / Disability Grant (if applicable)' },
    { key: 'retrenchment',    label: 'Certified Letter of Retrenchment / Unemployment Proof (if applicable)' },
    { key: 'guardianshipProof', label: 'Proof of Guardianship / Parenthood (if surname differs)' },
    { key: 'declarationSigned', label: 'Signed & Stamped Declaration (HTL 03 Section 7 – Commissioner of Oaths)', required: true },
  ];

  const missingHTL02 = htl02RequiredUploads.filter(f => f.required && !files[f.key]);
  const missingHTL03 = htl03RequiredUploads.filter(f => f.required && !files[f.key]);

  const validateStep = () => {
    if (step === 1) {
      if (!learner.surnameAndName || !learner.currentGrade || !learner.gender) {
        setError('Please complete learner name, current grade, and gender.'); return false;
      }
      if (!father.surname || !father.name) {
        setError('Please complete Father/Guardian surname and name.'); return false;
      }
      if (missingHTL02.length > 0) {
        setError(`Please upload: ${missingHTL02.map(f => f.label).join(', ')}`); return false;
      }
      if (!undertaking) {
        setError('Please accept the Parent/Guardian undertaking before proceeding.'); return false;
      }
    }
    if (step === 2) {
      if (!guardian.surname || !guardian.fullNames) {
        setError('Please complete guardian surname and full names (Section 3).'); return false;
      }
      if (!children[0].surname || !children[0].firstName || !children[0].grade) {
        setError('Please complete at least one child\'s details in Section 4.'); return false;
      }
    }
    if (step === 3) {
      if (missingHTL03.length > 0) {
        setError(`Please upload all required documents: ${missingHTL03.map(f => f.label).join(', ')}`);
        return false;
      }
    }
    setError(''); return true;
  };

  const goNext = () => { if (validateStep()) setStep(s => (s < 3 ? (s + 1) as 1|2|3 : s)); };
  const goBack = () => { setError(''); setStep(s => (s > 1 ? (s - 1) as 1|2|3 : s)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const uploads: UploadedFile[] = [];
      const allUploads = [...htl02RequiredUploads, ...htl03RequiredUploads];
      for (const field of allUploads) {
        const file = files[field.key];
        if (!file) continue;
        const dataUrl = await fileToDataUrl(file);
        uploads.push({ key: field.key, label: field.label, fileName: file.name, mimeType: file.type || 'application/octet-stream', dataUrl });
      }
      const nameParts = learner.surnameAndName.split(' ');
      const app: Application = {
        id: generateId(),
        firstName:          nameParts.slice(1).join(' ') || learner.surnameAndName,
        lastName:           nameParts[0] || '',
        dob:                '',
        gender:             learner.gender,
        grade:              learner.currentGrade,
        year:               learner.year,
        studentNumber:      generateStudentNumber(learner.year),
        guardianName:       `${father.name} ${father.surname}`.trim(),
        guardianRelationship: father.relationship || 'Father/Guardian',
        guardianPhone:      father.cellphone || father.telHome || '',
        guardianEmail:      '',
        address:            learner.homeAddress,
        locality:           '',
        previousSchool:     '',
        lastGradeCompleted: '',
        medicalInfo:        learner.healthProblems || learner.allergiesAndDietaryInfo,
        applicationType:    'Boarding',
        uploads,
        subjectMarks: [],
        averageMark:  0,
        status:       'Pending',
        submittedDate: todayISO(),
      };
      setApplications([app, ...getApplications()]);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Boarding Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Your HTL 02 hostel admission and HTL 03 bursary applications have been received. The school will be in contact shortly.
          </p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="py-12 sm:py-16 bg-gray-50">
      <SEO
        title="Boarding Application"
        description="Apply for boarding accommodation at Mount Hargreaves Senior Secondary School. Submit your hostel application for the 2027 academic year. Sigoga Location, Matatiele."
        path="/boarding"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Boarding Application</h1>

        {/* Info banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>This application covers two forms:</strong><br />
            <span className="font-medium">HTL 02</span> – Application for Admission to a Hostel &nbsp;|&nbsp;
            <span className="font-medium">HTL 03</span> – Application for a Boarding Bursary (incl. Commissioner of Oaths declaration)
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-school-green px-8 py-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-bold">Boarding & Bursary Application</h2>
                <p className="text-white/70 text-sm mt-1">
                  Province of the Eastern Cape – Department of Education &nbsp;·&nbsp; HTL 02 &amp; HTL 03
                </p>
              </div>
              <div className="text-right text-xs text-white/60 leading-relaxed">
                <div>Year: {learner.year}</div>
                <div>Step {step} of 3</div>
              </div>
            </div>

            {/* Progress */}
            <div className="relative h-1.5 bg-white/20 rounded-full mb-5 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                animate={{ width: `${((step - 1) / 2) * 100 + 33.33}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex flex-wrap gap-5">
              <StepBadge num={1} label="HTL 02 – Hostel Admission"   active={step === 1} done={step > 1} />
              <StepBadge num={2} label="HTL 03 – Bursary Details"    active={step === 2} done={step > 2} />
              <StepBadge num={3} label="Declaration & Documents"     active={step === 3} done={false} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="p-6 sm:p-8 space-y-10"
              >

                {/* ════════════ STEP 1 – HTL 02 ════════════ */}
                {step === 1 && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
                      HTL 02 · Application for Admission to a Hostel — to be completed by the school once submitted
                    </div>

                    {/* Learner */}
                    <section>
                      <SectionHeading title="1. Learner Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Year" required>
                          <select className={sel} value={learner.year} onChange={e => patchL('year', e.target.value)}>
                            {['2025','2026','2027','2028'].map(y => <option key={y}>{y}</option>)}
                          </select>
                        </Field>
                        <Field label="Admission No">
                          <input className={inp} value={learner.admissionNo} onChange={e => patchL('admissionNo', e.target.value)} placeholder="Completed by school" />
                        </Field>
                        <div />
                        <Field label="Surname & Name of Applicant" required className="sm:col-span-2">
                          <input className={inp} value={learner.surnameAndName} onChange={e => patchL('surnameAndName', e.target.value)} placeholder="Surname, First Name" />
                        </Field>
                        <Field label="ID Number">
                          <input className={inp} value={learner.idNumber} onChange={e => patchL('idNumber', e.target.value)} />
                        </Field>
                        <Field label="Age">
                          <input className={inp} type="number" min={10} max={25} value={learner.age} onChange={e => patchL('age', e.target.value)} />
                        </Field>
                        <Field label="Current Grade" required>
                          <select className={sel} value={learner.currentGrade} onChange={e => patchL('currentGrade', e.target.value)}>
                            <option value="">Select</option>
                            {['8','9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
                          </select>
                        </Field>
                        <Field label="Gender" required>
                          <select className={sel} value={learner.gender} onChange={e => patchL('gender', e.target.value)}>
                            <option value="">Select</option><option>Male</option><option>Female</option>
                          </select>
                        </Field>
                        <Field label="Health Status">
                          <select className={sel} value={learner.healthStatus} onChange={e => patchL('healthStatus', e.target.value)}>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="bad">Bad</option>
                          </select>
                        </Field>
                        <Field label="Home Address of Applicant" className="sm:col-span-2">
                          <input className={inp} value={learner.homeAddress} onChange={e => patchL('homeAddress', e.target.value)} />
                        </Field>
                        <Field label="Distance from Home to School (km)">
                          <input className={inp} type="number" min={0} value={learner.distanceHomeToSchool} onChange={e => patchL('distanceHomeToSchool', e.target.value)} />
                        </Field>
                        <Field label="Name & Address of School Admitted To" className="sm:col-span-2">
                          <input className={inp} value={learner.schoolNameAndAddress} onChange={e => patchL('schoolNameAndAddress', e.target.value)} placeholder="Mt Hargreaves SSS, Igoga Location, Matatiele" />
                        </Field>
                        <Field label="Surname & First Name(s) of Parent/Guardian" className="sm:col-span-2">
                          <input className={inp} placeholder="Enter parent/guardian full names" onChange={() => {}} value={`${father.name} ${father.surname}`.trim()} readOnly className={inp + ' bg-gray-50'} />
                          <span className="text-xs text-gray-400 mt-0.5">Auto-filled from parent details below</span>
                        </Field>
                      </div>

                      <div className="mt-4">
                        <Field label="Any Health Problems We Should Know Of? If yes, describe:">
                          <textarea className={inp + ' resize-none'} rows={2} value={learner.healthProblems} onChange={e => patchL('healthProblems', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Parent/Guardian Table */}
                    <section>
                      <SectionHeading title="8. Parent / Guardian Details" />
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left px-3 py-2 bg-gray-100 text-xs font-bold text-gray-600 uppercase w-44">Field</th>
                              <th className="text-left px-3 py-2 bg-school-green/10 text-xs font-bold text-school-green uppercase">Father / Guardian / Responsible Person</th>
                              <th className="text-left px-3 py-2 bg-blue-50 text-xs font-bold text-blue-600 uppercase">Mother / Relative</th>
                            </tr>
                          </thead>
                          <tbody>
                            {([
                              ['surname',        'Surname'],
                              ['name',           'Name'],
                              ['relationship',   'Relationship'],
                            ] as [keyof typeof father, string][]).map(([k, lbl]) => (
                              <tr key={k} className="border-t border-gray-100">
                                <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600">{lbl}</td>
                                <td className="px-2 py-1.5">
                                  <input className={inp} value={father[k]} onChange={e => patchF(k, e.target.value)} />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input className={inp} value={mother[k as keyof typeof mother]} onChange={e => patchM(k, e.target.value)} />
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-100">
                              <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600">Home Address</td>
                              <td className="px-2 py-1.5"><textarea className={inp + ' resize-none'} rows={2} value={father.homeAddress} onChange={e => patchF('homeAddress', e.target.value)} /></td>
                              <td className="px-2 py-1.5"><textarea className={inp + ' resize-none'} rows={2} value={mother.homeAddress} onChange={e => patchM('homeAddress', e.target.value)} /></td>
                            </tr>
                            {([
                              ['telHome',    'Telephone (H)'],
                              ['telWork',    'Telephone (W)'],
                              ['cellphone',  'Cellphone Number'],
                              ['nameOfEmployer',    'Name of Employer'],
                              ['addressOfEmployer', 'Address of Employer'],
                              ['occupation',  'Occupation'],
                              ['salaryIncome','Salary Income'],
                            ] as [keyof typeof father, string][]).map(([k, lbl]) => (
                              <tr key={k} className="border-t border-gray-100">
                                <td className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                                  {lbl}
                                  {k === 'salaryIncome' && <span className="block text-gray-400 font-normal">(Attach salary advice)</span>}
                                </td>
                                <td className="px-2 py-1.5"><input className={inp} value={father[k]} onChange={e => patchF(k, e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input className={inp} value={mother[k as keyof typeof mother]} onChange={e => patchM(k, e.target.value)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Doctor */}
                    <section>
                      <SectionHeading title="9–11. Doctor Details" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Name of Doctor">
                          <input className={inp} value={doctor.name} onChange={e => patchD('name', e.target.value)} />
                        </Field>
                        <Field label="Telephone of Doctor">
                          <input className={inp} type="tel" value={doctor.telephone} onChange={e => patchD('telephone', e.target.value)} />
                        </Field>
                        <Field label="Address of Doctor">
                          <input className={inp} value={doctor.address} onChange={e => patchD('address', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Medical Aid & Allergies */}
                    <section>
                      <SectionHeading title="12. Medical Aid & Dietary Information" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Medical Aid Name">
                          <input className={inp} value={learner.medicalAidName} onChange={e => patchL('medicalAidName', e.target.value)} />
                        </Field>
                        <Field label="Medical Aid Number">
                          <input className={inp} value={learner.medicalAidNumber} onChange={e => patchL('medicalAidNumber', e.target.value)} />
                        </Field>
                        <Field label="Allergies / Dietary Requirements / Medical Conditions" className="sm:col-span-2">
                          <textarea className={inp + ' resize-none'} rows={3} value={learner.allergiesAndDietaryInfo} onChange={e => patchL('allergiesAndDietaryInfo', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Salary uploads */}
                    <section>
                      <SectionHeading title="Document Uploads – HTL 02" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {htl02RequiredUploads.map(f => (
                          <FileUploadRow key={f.key} label={f.label} required={f.required} fileKey={f.key} files={files} onChange={handleFileChange} />
                        ))}
                      </div>
                    </section>

                    {/* Undertaking */}
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-3">
                        Undertaking by Parent / Guardian / Responsible Person
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        I, the undersigned, hereby undertake to:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5 mb-5 ml-2">
                        <li>Pay the prescribed boarding fee every term in advance.</li>
                        <li>Give a term's notice before terminating my child's residence at the hostel.</li>
                        <li>Pay all damages to hostel property incurred by my child.</li>
                        <li>Abide by all hostel rules and regulations, set out to and for me and my child.</li>
                      </ol>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" checked={undertaking} onChange={e => setUndertaking(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-school-green cursor-pointer" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          I accept and agree to the above undertaking as the parent/guardian of the applicant.
                        </span>
                      </label>
                    </section>
                  </>
                )}

                {/* ════════════ STEP 2 – HTL 03 Bursary ════════════ */}
                {step === 2 && (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 font-medium">
                      HTL 03 · Application for a Boarding Bursary — All children from one family attending the same school must be on one form
                    </div>

                    {/* Section 3: Guardian Particulars */}
                    <section>
                      <SectionHeading title="Section 3 – Particulars of Parent / Guardian" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Surname" required>
                          <input className={inp} value={guardian.surname} onChange={e => patchG('surname', e.target.value)} />
                        </Field>
                        <Field label="Full Names" required>
                          <input className={inp} value={guardian.fullNames} onChange={e => patchG('fullNames', e.target.value)} />
                        </Field>
                        <div />
                        <Field label="Postal Address" className="sm:col-span-2">
                          <input className={inp} value={guardian.postalAddress} onChange={e => patchG('postalAddress', e.target.value)} />
                        </Field>
                        <Field label="Postal Code">
                          <input className={inp} value={guardian.postalCode} onChange={e => patchG('postalCode', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Home Address" className="sm:col-span-2">
                          <input className={inp} value={guardian.homeAddress} onChange={e => patchG('homeAddress', e.target.value)} />
                        </Field>
                        <Field label="Home Code">
                          <input className={inp} value={guardian.homeCode} onChange={e => patchG('homeCode', e.target.value)} maxLength={6} />
                        </Field>
                        <Field label="Tel (Home) Code">
                          <input className={inp} value={guardian.telHomeCode} onChange={e => patchG('telHomeCode', e.target.value)} />
                        </Field>
                        <Field label="Tel (Home) Number">
                          <input className={inp} type="tel" value={guardian.telHome} onChange={e => patchG('telHome', e.target.value)} />
                        </Field>
                        <Field label="Tel (Work) Code">
                          <input className={inp} value={guardian.telWorkCode} onChange={e => patchG('telWorkCode', e.target.value)} />
                        </Field>
                        <Field label="Tel (Work) Number">
                          <input className={inp} type="tel" value={guardian.telWork} onChange={e => patchG('telWork', e.target.value)} />
                        </Field>
                        <div />
                        <Field label="Gender">
                          <select className={sel} value={guardian.gender} onChange={e => patchG('gender', e.target.value)}>
                            <option value="">Select</option><option>Male</option><option>Female</option>
                          </select>
                        </Field>
                        <Field label="Marital Status">
                          <select className={sel} value={guardian.maritalStatus} onChange={e => patchG('maritalStatus', e.target.value)}>
                            <option value="">Select</option>
                            <option>Married</option><option>Single</option><option>Divorced</option><option>Widow(er)</option>
                          </select>
                        </Field>
                        <Field label="If Surname Differs from Child's, Explain (see 2.5)" className="sm:col-span-2">
                          <input className={inp} value={guardian.surnameDiffersReason} onChange={e => patchG('surnameDiffersReason', e.target.value)} />
                        </Field>
                      </div>
                    </section>

                    {/* Section 4: Children */}
                    <section>
                      <SectionHeading title="Section 4 – Particulars of Children (Application Made For)" />
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-school-green/10">
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">#</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Surname</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">First Name</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Date of Birth</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Grade</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">School</th>
                            </tr>
                          </thead>
                          <tbody>
                            {children.map((c, i) => (
                              <tr key={i} className="border-t border-gray-100">
                                <td className="px-3 py-2 text-xs text-gray-400 font-bold">{i + 1}</td>
                                <td className="px-2 py-1.5"><input className={inp} value={c.surname} onChange={e => patchChild(i, 'surname', e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input className={inp} value={c.firstName} onChange={e => patchChild(i, 'firstName', e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input type="date" className={inp} value={c.dob} onChange={e => patchChild(i, 'dob', e.target.value)} /></td>
                                <td className="px-2 py-1.5">
                                  <select className={sel} value={c.grade} onChange={e => patchChild(i, 'grade', e.target.value)}>
                                    <option value="">-</option>
                                    {['8','9','10','11','12'].map(g => <option key={g}>Grade {g}</option>)}
                                  </select>
                                </td>
                                <td className="px-2 py-1.5"><input className={inp} value={c.school} onChange={e => patchChild(i, 'school', e.target.value)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button type="button" onClick={() => setChildren(p => [...p, { surname:'',firstName:'',dob:'',grade:'',school:'' }])}
                        className="mt-2 text-xs text-school-green font-semibold hover:underline">+ Add another child</button>
                    </section>

                    {/* Other dependent children */}
                    <section>
                      <SectionHeading title="Other Children Dependent on Parent / Guardian" />
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Surname</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">First Names</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Date of Birth</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Reason for Dependence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {otherChildren.map((c, i) => (
                              <tr key={i} className="border-t border-gray-100">
                                <td className="px-2 py-1.5"><input className={inp} value={c.surname} onChange={e => patchOtherChild(i, 'surname', e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input className={inp} value={c.firstName} onChange={e => patchOtherChild(i, 'firstName', e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input type="date" className={inp} value={c.dob} onChange={e => patchOtherChild(i, 'dob', e.target.value)} /></td>
                                <td className="px-2 py-1.5"><input className={inp} value={c.reason} onChange={e => patchOtherChild(i, 'reason', e.target.value)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 5: Income */}
                    <section>
                      <SectionHeading title="Section 5 – Details of Income" />
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-school-green/10">
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase w-24">Person</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Name of Employer</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Tel of Employer</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Type of Income</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase">Gross Income</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(['Mother','Father','Guardian'] as const).map(person => {
                              const prefix = person.toLowerCase() as 'mother' | 'father' | 'guardian';
                              return (
                                <tr key={person} className="border-t border-gray-100">
                                  <td className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-50">{person}</td>
                                  <td className="px-2 py-1.5"><input className={inp} value={income[`${prefix}Employer` as keyof typeof income]} onChange={e => patchInc(`${prefix}Employer`, e.target.value)} /></td>
                                  <td className="px-2 py-1.5"><input className={inp} type="tel" value={income[`${prefix}EmployerTel` as keyof typeof income]} onChange={e => patchInc(`${prefix}EmployerTel`, e.target.value)} /></td>
                                  <td className="px-2 py-1.5">
                                    <select className={sel} value={income[`${prefix}IncomeType` as keyof typeof income]} onChange={e => patchInc(`${prefix}IncomeType`, e.target.value)}>
                                      <option value="">Select</option>
                                      <option>Salary</option><option>Pension</option><option>Disability Grant</option>
                                      <option>Child Support Grant</option><option>Unemployed</option><option>Other</option>
                                    </select>
                                  </td>
                                  <td className="px-2 py-1.5"><input className={inp} placeholder="R 0.00" value={income[`${prefix}GrossIncome` as keyof typeof income]} onChange={e => patchInc(`${prefix}GrossIncome`, e.target.value)} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Section 6: Distances */}
                    <section>
                      <SectionHeading title="Section 6 – Distances" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="6.1 Distance from Learner's Home to School Applied For (km)">
                          <input className={inp} type="number" min={0} value={distances.distanceToAppliedSchool} onChange={e => patchDis('distanceToAppliedSchool', e.target.value)} />
                        </Field>
                        <Field label="6.2 Name of Nearest School">
                          <input className={inp} value={distances.nearestSchoolName} onChange={e => patchDis('nearestSchoolName', e.target.value)} />
                        </Field>
                        <Field label="6.3 Distance from Learner's Home to Nearest School (km)">
                          <input className={inp} type="number" min={0} value={distances.nearestSchoolDistance} onChange={e => patchDis('nearestSchoolDistance', e.target.value)} />
                        </Field>
                        <Field label="6.4 Name of Nearest School with a Hostel">
                          <input className={inp} value={distances.nearestHostelSchoolName} onChange={e => patchDis('nearestHostelSchoolName', e.target.value)} />
                        </Field>
                        <Field label="6.5 Distance to Nearest School with a Hostel (km)">
                          <input className={inp} type="number" min={0} value={distances.nearestHostelSchoolDistance} onChange={e => patchDis('nearestHostelSchoolDistance', e.target.value)} />
                        </Field>
                        <Field label="6.7 From Which Date is Bursary Required">
                          <input type="date" className={inp} value={distances.bursaryRequiredFrom} onChange={e => patchDis('bursaryRequiredFrom', e.target.value)} />
                        </Field>
                        <Field label="6.6 Reason(s) for Not Attending Nearest School / Hostel School" className="sm:col-span-2">
                          <textarea className={inp + ' resize-none'} rows={3} value={distances.reasonNotAttendingNearest} onChange={e => patchDis('reasonNotAttendingNearest', e.target.value)} placeholder="Attach necessary letters that may serve as reason" />
                        </Field>
                      </div>
                    </section>
                  </>
                )}

                {/* ════════════ STEP 3 – Declaration & Uploads ════════════ */}
                {step === 3 && (
                  <>
                    {/* Download declaration */}
                    <section className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Download size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-blue-900 text-base mb-1">
                            Step 1 — Download &amp; Sign the HTL 03 Declaration (Section 7)
                          </h4>
                          <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                            The HTL 03 bursary application requires a declaration sworn before a <strong>Commissioner of Oaths</strong> (e.g. at your nearest Police Station).
                            Download the form below, print it, take it to be signed and stamped, then upload it back here.
                          </p>
                          <button
                            type="button"
                            onClick={() => downloadDeclarationForm(guardian.fullNames || 'Guardian', learner.year)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow"
                          >
                            <Download size={16} /> Download Declaration Form (HTL 03 Section 7)
                          </button>
                          <p className="text-xs text-blue-600 mt-3">
                            The downloaded file is an HTML form. Open it in a browser and print it, or save as PDF.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Instructions reminder */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1.5">
                      <p className="font-bold">Instructions for HTL 03 (Section 1):</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>The parent/guardian must complete Sections 3–7 in full.</li>
                        <li>All children from one family at the same school must be on one form.</li>
                        <li>Attach proof of gross family income (salary slip / certified employer statement).</li>
                        <li>Pensioners must attach proof of old age pension or disability grant.</li>
                        <li>Certified letters of retrenchment or proof of unemployment must be attached.</li>
                        <li>Section 7 must be certified by a Commissioner of Oaths (not the school principal).</li>
                        <li><strong>Applications not submitted by end of September will not be considered.</strong></li>
                      </ul>
                    </div>

                    {/* All document uploads */}
                    <section>
                      <SectionHeading title="Step 2 — Upload All Supporting Documents" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {htl03RequiredUploads.map(f => (
                          <FileUploadRow key={f.key} label={f.label} required={f.required} fileKey={f.key} files={files} onChange={handleFileChange} />
                        ))}
                      </div>
                    </section>

                    {/* Qualifications notice */}
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-700 space-y-2">
                      <p className="font-black uppercase tracking-widest text-xs text-gray-600 mb-2">Bursary Qualifications (Section 2)</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Bursaries are not available for those who live outside the Province of the Eastern Cape.</li>
                        <li>Bursaries are not available for learners who live within 5 km of a suitable school.</li>
                        <li>Bursaries are available only to the learner's home.</li>
                        <li>If a learner cannot attend a nearby school, a letter from that school's principal is required.</li>
                        <li>Proof of guardianship required if learner has a different surname from the guardian.</li>
                      </ul>
                    </section>
                  </>
                )}

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button type="button" onClick={goBack} disabled={step === 1}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={16} /> Back
                  </button>

                  {step < 3 ? (
                    <button type="button" onClick={goNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 transition shadow">
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" disabled={submitting}
                      className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-school-green text-white text-sm font-bold hover:bg-school-green/90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow">
                      {submitting
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                        : <><CheckCircle size={16} /> Submit Boarding Application</>}
                    </button>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          HTL 02 &amp; HTL 03 forms · Province of the Eastern Cape – Department of Education ·
          Applications saved in school browser storage for this demo.
        </p>
      </div>
    </div>
  );
};
